'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useUserStore } from '@/store/useUserStore'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MessageSquareOff, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { InboxItem } from '@/utils/types/chat'

export default function InboxPage() {
  const currentUser = useUserStore((state) => state.user)
  
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!currentUser) return

    const fetchInbox = async () => {
      // 1. Fetch all conversations where the current user is a participant
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_a.eq.${currentUser.id},user_b.eq.${currentUser.id}`)
        .order('updated_at', { ascending: false }) // Most recently updated at the top

      if (convError) {
        toast.error("Failed to load inbox")
        setLoading(false)
        return
      }

      if (!convData || convData.length === 0) {
        setInboxItems([])
        setLoading(false)
        return
      }

      // 2. Extract the IDs of the people you are chatting with
      const partnerIds = convData.map(conv => 
        conv.user_a === currentUser.id ? conv.user_b : conv.user_a
      )

      // 3. Fetch all their profiles in one single, optimized database call
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', partnerIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
      }

      // Create a quick lookup map for the profiles
      const profileMap = new Map()
      if (profilesData) {
        profilesData.forEach(profile => profileMap.set(profile.id, profile))
      }

      // 4. Merge the conversations and profiles together
      const mergedData: InboxItem[] = convData.map(conv => {
        const pId = conv.user_a === currentUser.id ? conv.user_b : conv.user_a
        return {
          conversationId: conv.id,
          updatedAt: conv.updated_at,
          partnerId: pId,
          partnerProfile: profileMap.get(pId) || null
        }
      })

      setInboxItems(mergedData)
      setLoading(false)
    }

    fetchInbox()
  }, [currentUser, supabase])

  // Helper to format timestamps naturally (e.g., "10:45 AM" if today, or "Mar 10" if older)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Helper for the Avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Messages</h1>
          <p className="text-sm text-zinc-400 mt-1">Your recent conversations</p>
        </div>

        {/* Inbox List Area */}
        {inboxItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-zinc-800 border-dashed rounded-xl bg-zinc-950/50">
            <MessageSquareOff className="h-12 w-12 mb-4 opacity-50 text-zinc-600" />
            <p className="text-lg font-medium text-zinc-300">No active chats</p>
            <p className="text-sm mt-1">Reach out to someone from the feed to start chatting.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inboxItems.map((item) => (
              <Link key={item.conversationId} href={`/protected/chat/${item.conversationId}`} className="block group">
                <Card className="bg-zinc-950/80 border-zinc-800 hover:border-violet-600/50 hover:bg-zinc-900 transition-all duration-200">
                  <CardHeader className="flex flex-row items-center p-4">
                    
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border border-zinc-700 bg-zinc-800 mr-4 group-hover:border-violet-500 transition-colors">
                      <AvatarImage src={item.partnerProfile?.avatar_url || ''} />
                      <AvatarFallback className="text-zinc-300 font-medium bg-zinc-800">
                        {getInitials(item.partnerProfile?.full_name || item.partnerProfile?.username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <CardTitle className="text-base font-semibold text-zinc-100 truncate">
                          {item.partnerProfile?.full_name || 'Unknown User'}
                        </CardTitle>
                        <span className="text-xs text-zinc-500 whitespace-nowrap ml-2">
                          {formatTime(item.updatedAt)}
                        </span>
                      </div>
                      <CardDescription className="text-sm text-zinc-400 truncate">
                        {item.partnerProfile?.username ? `@${item.partnerProfile.username}` : 'NIT Delhi Student'}
                      </CardDescription>
                    </div>

                    {/* Arrow indicator */}
                    <ChevronRight className="w-5 h-5 text-zinc-600 ml-4 group-hover:text-violet-500 transition-colors" />
                    
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}