'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/useUserStore'

// Define the shape of our Item
type Item = {
  id: string
  title: string
  description: string
  type: 'LOST' | 'FOUND'
  image_url: string | null
  created_at: string
  user_id: string
}

export default function FeedPage() {
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState('')
  const [startingChatId, setStartingChatId] = useState<string | null>(null) // this tracks which "contact owner" button is clicked
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const currentUser = useUserStore((state) => state.user)

  useEffect(() => {
    // 1. Initial Fetch
    const fetchItems = async () => {
      const { data } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setItems(data as Item[])
    }

    fetchItems()

    // 2. Realtime Subscription (Live Updates)
    const channel = supabase
      .channel('items-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'items' }, (payload) => {
        // Prepend new item to the list instantly
        setItems((current) => [payload.new as Item, ...current])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  //Function to handle contact-owner/contact finder(to initialize/continue the chat)
  const handleStartChat = async (ownerId: string) => {
    setStartingChatId(ownerId) //Start loading the spinner for this user

    //Now we will call our sql trigger
    const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
      other_user_id: ownerId
    })

    if (error || !conversationId) {
      toast.error("Failed To Start A Conversation...")
      setStartingChatId(null)
      return
    }

    //Redirect to chat window
    router.push(`/protected/chat/${conversationId}`)
  }

  // Filter items based on Search + Tab is handled by TabsContent logic below for simplicity or we can filter arrays
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Lost & Found
          </h1>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search keys, bottles, id cards..."
              className="pl-10 bg-zinc-900 border-zinc-800 focus:border-violet-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/protected/report">
            <Button className="bg-violet-600 hover:bg-violet-700">Report Item</Button>
          </Link>
        </div>

        {/* Tabs for Filtering */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost" className="data-[state=active]:text-red-400">Lost</TabsTrigger>
            <TabsTrigger value="found" className="data-[state=active]:text-green-400">Found</TabsTrigger>
          </TabsList>

          {/* Helper function to render grid */}
          {['all', 'lost', 'found'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems
                  .filter(item => tab === 'all' ? true : item.type.toLowerCase() === tab)
                  .map((item) => (
                    <Card key={item.id} className="bg-zinc-950 border-zinc-800 overflow-hidden hover:border-violet-900/50 transition-colors">

                      {/* Image Area */}
                      <div className="relative h-48 w-full bg-zinc-900">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-zinc-700">No Image</div>
                        )}
                        <Badge className={`absolute top-2 right-2 ${item.type === 'LOST' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
                          {item.type}
                        </Badge>
                      </div>

                      <CardHeader>
                        <CardTitle className="text-lg text-zinc-100">{item.title}</CardTitle>
                        <p className="text-xs text-zinc-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-zinc-400 line-clamp-2">
                          {item.description}
                        </p>
                      </CardContent>

                      <CardFooter>
                        {/* Link to Chat Page with the Item Owner */}
                        {
                          currentUser?.id === item.user_id ? (
                            <div>
                              <Button disabled variant="secondary" className="w-full bg-zinc-800 text-zinc-500 border-none">
                                <UserIcon className="mr-2 h-4 w-4" />
                                This is your post
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Button
                              variant={`outline`}
                              className='w-full border-zinc-700 hover:bg-zinc-800 hover:text-white'
                              onClick={() => handleStartChat(item.user_id)}
                              disabled={startingChatId === item.user_id}
                              >
                                {
                                  startingChatId === item.user_id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                  )
                                }
                                {item.type === 'LOST' ? 'Contact Owner' : 'Contact Finder'}
                              </Button>
                            </div>
                          )
                        }
                      </CardFooter>
                    </Card>
                  ))}
              </div>

              {/* Empty State */}
              {filteredItems.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                  No items found.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}