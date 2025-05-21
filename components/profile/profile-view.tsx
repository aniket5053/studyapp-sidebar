"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Book, Calendar, Edit, LogOut, Mail, Moon, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useApp } from "@/context/app-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "react-hot-toast"

export function ProfileView() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    university: "",
    major: "",
    year: "",
  })
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useApp()
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!isMounted) return;

        if (error) {
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .upsert({ 
                id: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
                university: "",
                major: "",
                year: ""
              }, {
                onConflict: 'id'
              })
              .select()
              .single();
            
            if (!isMounted) return;

            if (insertError) {
              toast.error(`Failed to create profile: ${insertError.message}`);
              return;
            }

            if (newProfile) {
              setProfile(prev => ({
                ...prev,
                name: newProfile.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "",
                university: newProfile.university || "",
                major: newProfile.major || "",
                year: newProfile.year || "",
              }));
            }
          } else {
            toast.error(`Failed to load profile: ${error.message}`);
            return;
          }
        } else if (data) {
          setProfile(prev => ({
            ...prev,
            name: data.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "",
            university: data.university || "",
            major: data.major || "",
            year: data.year || "",
          }));
        }
      } catch (err) {
        if (!isMounted) return;
        toast.error('An unexpected error occurred');
      }
    };

    // Set initial profile data from user
    setProfile(prev => ({
      ...prev,
      email: user?.email || "",
      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "",
    }));

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user.id

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: profile.name }
      })

      if (updateError) throw updateError

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          university: profile.university || "",
          major: profile.major || "",
          year: profile.year || "",
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profileError) throw profileError

      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="w-full md:w-1/3">
            <Card className="glass-morphism">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-700 shadow-md mb-4">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-violet-400 to-indigo-400 text-white text-2xl">
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold dark:text-white">{profile.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="text-sm dark:text-white">Account Settings</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                    <Bell className="h-5 w-5 text-slate-400" />
                    <span className="text-sm dark:text-white">Notifications</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                    <Settings className="h-5 w-5 text-slate-400" />
                    <span className="text-sm dark:text-white">Preferences</span>
                  </div>
                  <div 
                    className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5 text-slate-400" />
                    <span className="text-sm dark:text-white">Log Out</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-full mb-6">
                <TabsTrigger
                  value="profile"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Settings
                </TabsTrigger>
                <TabsTrigger
                  value="academic"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Academic
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="dark:text-white">Profile Information</span>
                      {!isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            disabled
                            className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                          />
                          <p className="text-sm text-slate-500">Email cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="university">University</Label>
                          <Input
                            id="university"
                            value={profile.university}
                            onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            value={profile.major}
                            onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <select
                            id="year"
                            className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            value={profile.year}
                            onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                          >
                            <option value="Freshman">Freshman</option>
                            <option value="Sophomore">Sophomore</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                            <option value="Graduate">Graduate</option>
                          </select>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveProfile}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-2">
                          <User className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium dark:text-white">Full Name</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2">
                          <Mail className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium dark:text-white">Email</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
                            <p className="text-xs text-slate-400">Email cannot be changed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2">
                          <Book className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium dark:text-white">University</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.university}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2">
                          <Book className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium dark:text-white">Major</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.major}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2">
                          <Calendar className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium dark:text-white">Year</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.year}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle className="dark:text-white">App Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base dark:text-white">Dark Mode</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Switch between light and dark themes
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <Switch
                            checked={theme === "dark"}
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base dark:text-white">Email Notifications</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Receive email notifications for important updates
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base dark:text-white">Push Notifications</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Receive push notifications for task reminders
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base dark:text-white">Sound Effects</Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Play sound effects for notifications and actions
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic">
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Academic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-2">
                        <Book className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium dark:text-white">GPA</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">3.8/4.0</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium dark:text-white">Expected Graduation</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">May 2026</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Book className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium dark:text-white">Credits Completed</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">75/120</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
