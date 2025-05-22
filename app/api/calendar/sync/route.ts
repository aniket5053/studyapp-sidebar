import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { syncCalendarEvents, refreshGoogleToken } from '@/lib/calendar-service'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get calendar connections
    const { data: connections, error: connectionsError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', session.user.id)

    if (connectionsError) {
      console.error('Error fetching calendar connections:', connectionsError)
      return NextResponse.json({ error: 'Failed to fetch calendar connections' }, { status: 500 })
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({ error: 'No calendar connections found' }, { status: 404 })
    }

    // Get sync parameters from request
    const { startDate, endDate } = await request.json()
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing date range' }, { status: 400 })
    }

    const syncedTasks = []
    const errors = []

    // Sync each connection
    for (const connection of connections) {
      try {
        console.log('Syncing calendar connection:', connection.id)
        
        // Check if token needs refresh
        let currentConnection = {
          id: connection.id,
          userId: connection.user_id,
          type: connection.type,
          accessToken: connection.access_token,
          refreshToken: connection.refresh_token,
          expiresAt: new Date(connection.expires_at).getTime(),
          calendarId: connection.calendar_id,
        }

        // Try to sync events
        const tasks = await syncCalendarEvents(
          currentConnection,
          new Date(startDate),
          new Date(endDate)
        )

        // If we got here, the token was refreshed if needed
        // Update the connection in the database with new tokens if they were refreshed
        if (currentConnection.accessToken !== connection.access_token) {
          const { error: updateError } = await supabase
            .from('calendar_connections')
            .update({
              access_token: currentConnection.accessToken,
              expires_at: new Date(currentConnection.expiresAt).toISOString(),
            })
            .eq('id', connection.id)

          if (updateError) {
            console.error('Error updating connection tokens:', updateError)
          }
        }

        console.log(`Fetched ${tasks.length} tasks from calendar`)

        if (tasks.length > 0) {
          // Prepare tasks for insertion
          const tasksToInsert = tasks.map(task => ({
            ...task,
            user_id: session.user.id,
            source: 'google',
            source_id: `google_${task.source_id}`
          }))

          console.log(`Prepared ${tasksToInsert.length} tasks for insertion`)

          // Get existing tasks for this user
          const { data: existingTasks, error: fetchError } = await supabase
            .from('tasks')
            .select('source_id')
            .eq('user_id', session.user.id)
            .eq('source', 'google')

          if (fetchError) {
            console.error('Error fetching existing tasks:', fetchError)
            errors.push(`Failed to fetch existing tasks for ${connection.type} calendar`)
            continue
          }

          console.log(`Found ${existingTasks?.length || 0} existing tasks`)

          // Filter out tasks that already exist
          const existingSourceIds = new Set(existingTasks?.map(t => t.source_id) || [])
          const newTasks = tasksToInsert.filter(task => !existingSourceIds.has(task.source_id))

          console.log(`Found ${newTasks.length} new tasks to insert`)

          if (newTasks.length > 0) {
            console.log(`Inserting ${newTasks.length} new tasks`)
            
            // Insert tasks one by one to handle duplicates gracefully
            for (const task of newTasks) {
              console.log(`Inserting task: ${task.title} (${task.source_id})`)
              const { data: insertedTask, error: insertError } = await supabase
                .from('tasks')
                .insert(task)
                .select()
                .single()

              if (insertError) {
                if (insertError.code === '23505') { // Unique violation
                  console.log(`Task ${task.source_id} already exists, skipping`)
                  continue
                }
                console.error('Error inserting task:', insertError)
                errors.push(`Failed to insert task ${task.title}: ${insertError.message}`)
              } else if (insertedTask) {
                console.log(`Successfully inserted task: ${insertedTask.title}`)
                syncedTasks.push(insertedTask)
              }
            }
            
            console.log(`Successfully inserted ${syncedTasks.length} tasks`)
          } else {
            console.log('No new tasks to insert')
          }
        }
      } catch (error) {
        console.error(`Error syncing ${connection.type} calendar:`, error)
        errors.push(`Failed to sync ${connection.type} calendar: ${error.message}`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Some syncs failed', 
        details: errors,
        syncedTasks 
      }, { status: 207 })
    }

    return NextResponse.json({ 
      message: `Successfully synced ${syncedTasks.length} tasks`,
      syncedTasks 
    })
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync calendar',
      details: error.message 
    }, { status: 500 })
  }
} 