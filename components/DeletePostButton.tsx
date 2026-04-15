'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type DeletePostButtonProps = {
  itemId: string
  imageUrl?: string | null
}

export default function DeletePostButton({ itemId, imageUrl }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      // 1. Delete the image from our specific 'lost-found' bucket
      if (imageUrl) {
        // Supabase public URLs end with the filename, so we extract it
        const fileName = imageUrl.split('/').pop() 
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('lost-found')
            .remove([fileName])

          if (storageError) {
            console.error("Storage deletion failed, but continuing to DB deletion:", storageError)
          }
        }
      }

      // 2. Delete the actual post from the 'items' table
      const { error: dbError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (dbError) throw dbError

      toast.success("Post deleted successfully")
      
      // 3. Silently refresh the feed so the post disappears
      router.refresh() 

    } catch (error: any) {
      toast.error("Failed to delete post", {
        description: error.message
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors h-8 w-8 rounded-full"
      title="Delete Post"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  )
}