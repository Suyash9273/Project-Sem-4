'use client'

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useUserStore } from "@/store/useUserStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Loader2, MoreVertical, Paperclip, Phone } from "lucide-react"
import { toast } from "sonner"
import { Message } from "@/utils/types/chat"
import { PartnerProfile } from "@/utils/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const page = () => {
  const params = useParams()
  const currentUser = useUserStore((state) => state.user)
  const router = useRouter()
  const conversationId = params.conversationId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [partner, setPartner] = useState<PartnerProfile | null>(null)

  //Ref for auto-scrolling to the bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  //1. We will fetch initial messages and subscribe to real-time supabse channel
  useEffect(() => {
    if (!currentUser || !conversationId) return

    const loadChatData = async () => {
      //a. Fetch the conversation to find the id of receiver end
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('user_a, user_b')
        .eq('id', conversationId)
        .single() //single is written because normally it returns an array in which we have multiple records but in this case we are sure that there is only one record so....
      if (convError || !convData) {
        toast.error("Could not load conversations detail")
        setLoading(false)
        return
      }
      const partnerId = convData.user_a === currentUser.id ? convData.user_b : convData.user_a

      //b. Fetching chat partner's profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', partnerId)
        .single()
      if (profileData) {
        setPartner(profileData)
      }

      //c. Fetch the message history
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgError) {
        toast.error("Failed To Load Messages")
      }
      else {
        setMessages(msgData || [])
      }

      setLoading(false)
    }

    loadChatData()

    //2. We have to check strictly for real time inserts
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          //when a new message hits our db then we have to push it to screen immediately
          const incomingMessage = payload.new as Message
          setMessages((prev) => [...prev, incomingMessage])
        }
      )
      .subscribe()

    //Now clean the subscription when user leaves this page
    return () => {
      supabase.removeChannel(channel)
    }

  }, [currentUser, conversationId, supabase])

  //2. Auto Scroll To Bottom Feature
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  //3. Send The Message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    setSending(true)
    const contentToSend = newMessage.trim()
    setNewMessage('') //clear the input field(if there were any previous uncleared message)

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: contentToSend,
        is_read: false
      })

    if (error) {
      toast.error("Failed To Send Message")
      setNewMessage(contentToSend) //Put text back if it failed
    }
    else {
      //Also update the 'updated_at' timestamp on the conversation for the inbox sorting await supabase
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    }

    setSending(false)
  }

  if (!currentUser) return null

  //Helper function to get initial letter for avatar fallback
  const getInitials = (username?: string | null) => {
    if (!username) return 'X' //for those users who signed up without any name
    return username.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-black text-white">
      
      {/* --- UPDATED HEADER --- */}
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-zinc-800 rounded-full shrink-0">
          <ArrowLeft className="w-5 h-5 text-zinc-300" />
        </Button>
        
        {loading ? (
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-zinc-800 rounded"></div>
              <div className="h-3 w-16 bg-zinc-800 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-zinc-700 bg-zinc-800">
              <AvatarImage src={partner?.avatar_url || ''} alt={partner?.full_name || 'User'} />
              <AvatarFallback className="text-zinc-300 font-medium">
                {getInitials(partner?.full_name || partner?.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-zinc-100 leading-tight">
                {partner?.full_name || 'Unknown User'}
              </h2>
              <p className="text-xs text-zinc-400">
                {partner?.username ? `@${partner.username}` : 'NIT Delhi Student'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area (Unchanged) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-500 space-y-2">
            <p className="bg-zinc-900 px-4 py-2 rounded-full text-sm">Say hello to {partner?.full_name?.split(' ')[0] || 'them'}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-violet-600 text-white rounded-br-sm' 
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} /> 
      </div>

      {/* Input Area (Unchanged) */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-zinc-900 border-zinc-700 text-white focus-visible:ring-violet-500 rounded-full px-4"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || sending || loading}
          size="icon"
          className="rounded-full bg-violet-600 hover:bg-violet-700 text-white transition-all"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  )
}

export default page
