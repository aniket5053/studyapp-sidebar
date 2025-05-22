import { Task } from "./data"

// Google Calendar API configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI

// Google Calendar API endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
  calendarId: string
  source: 'google'
}

export interface CalendarConnection {
  id: string
  userId: string
  type: 'google'
  accessToken: string
  refreshToken: string
  expiresAt: number
  calendarId: string
}

// Google Calendar OAuth flow
export const initiateGoogleAuth = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
  })

  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`
}

// Exchange authorization code for access token (Google)
export const exchangeGoogleCode = async (code: string): Promise<CalendarConnection> => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code')
  }

  const data = await response.json()
  return {
    id: data.id,
    userId: '', // Will be set by the server
    type: 'google',
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    calendarId: 'primary', // Default to primary calendar
  }
}

// Refresh Google Calendar access token
export const refreshGoogleToken = async (connection: CalendarConnection): Promise<CalendarConnection> => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: connection.refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Google access token')
  }

  const data = await response.json()
  return {
    ...connection,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}

// Fetch events from Google Calendar
export const fetchGoogleEvents = async (
  connection: CalendarConnection,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  // Check if token needs refresh
  if (Date.now() >= connection.expiresAt) {
    connection = await refreshGoogleToken(connection)
  }

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${connection.calendarId}/events?` +
    new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    }),
    {
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid, try refreshing
      connection = await refreshGoogleToken(connection)
      // Retry the request with new token
      const retryResponse = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${connection.calendarId}/events?` +
        new URLSearchParams({
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
        }),
        {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
        }
      )
      if (!retryResponse.ok) {
        throw new Error('Failed to fetch Google Calendar events after token refresh')
      }
      const data = await retryResponse.json()
      return data.items.map((event: any) => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location,
        calendarId: connection.calendarId,
        source: 'google',
      }))
    }
    throw new Error('Failed to fetch Google Calendar events')
  }

  const data = await response.json()
  return data.items.map((event: any) => ({
    id: event.id,
    title: event.summary,
    description: event.description,
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    location: event.location,
    calendarId: connection.calendarId,
    source: 'google',
  }))
}

// Convert calendar event to task
export function convertEventToTask(event: CalendarEvent): Omit<Task, 'id' | 'user_id'> {
  return {
    title: event.title,
    type: 'event',
    status: 'not-started',
    date: event.start,
    source: 'google',
    source_id: event.id,
    location: event.location || ''
  }
}

// Sync calendar events to tasks
export const syncCalendarEvents = async (
  connection: CalendarConnection,
  startDate: Date,
  endDate: Date
): Promise<Task[]> => {
  const events = await fetchGoogleEvents(connection, startDate, endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Filter out events before today and convert to tasks
  return events
    .filter(event => new Date(event.start) >= today)
    .map(convertEventToTask)
} 