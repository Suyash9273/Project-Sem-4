'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { useUserStore } from '@/store/useUserStore' // <--- IMPORT ZUSTAND
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'

export function ReportItemForm() {
  const router = useRouter()
  // Access the user directly from the store
  const user = useUserStore((state) => state.user) 
  
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle File Selection & Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleRemoveImage = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // 1. INSTANT AUTH CHECK (No network call needed)
    if (!user) {
      toast.error("Authentication Error", { description: "You must be logged in to post." })
      router.push('/login')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string 

    try {
      let image_url = null

      // 2. Upload Image (If selected)
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('lost-found')
          .upload(filePath, file)

        if (uploadError) throw new Error("Image upload failed: " + uploadError.message)

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('lost-found')
          .getPublicUrl(filePath)
          
        image_url = publicUrl
      }

      // 3. Insert Record into DB
      const { error: dbError } = await supabase
        .from('items')
        .insert({
          user_id: user.id, // Use the user ID from the store
          title,
          description,
          type, 
          image_url,
          status: 'OPEN'
        })

      if (dbError) throw new Error(dbError.message)

      toast.success("Item Posted!", { description: "Your post is now live on the feed." })
      router.push('/protected/feed') // Fixed: Should point to the page route, not API
      
    } catch (error: any) {
      toast.error("Submission Failed", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg border-zinc-800 bg-zinc-950/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-white">Report an Item</CardTitle>
        <CardDescription className="text-zinc-400">
          Provide details so others can help you.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          
          {/* Type Selection */}
          <div className="space-y-3">
            <Label className="text-zinc-300">I am reporting...</Label>
            <RadioGroup defaultValue="LOST" name="type" className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="LOST" id="lost" className="peer sr-only" />
                <Label
                  htmlFor="lost"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-900 p-4 hover:bg-zinc-800 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-500 cursor-pointer transition-all"
                >
                  <span className="font-bold">I LOST something</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="FOUND" id="found" className="peer sr-only" />
                <Label
                  htmlFor="found"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-900 p-4 hover:bg-zinc-800 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-500 cursor-pointer transition-all"
                >
                  <span className="font-bold">I FOUND something</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-300">Title</Label>
            <Input 
              id="title" 
              name="title" 
              placeholder="e.g. Blue Water Bottle" 
              className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-violet-500" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-zinc-300">Description</Label>
            <Textarea 
              id="desc" 
              name="description" 
              placeholder="Describe the item, location, and time..." 
              className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-violet-500 min-h-[100px]" 
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Upload Image (Optional)</Label>
            
            {!previewUrl ? (
              <div className="relative flex items-center justify-center w-full h-32 rounded-md border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                  <p className="text-sm text-zinc-500">Click to upload image</p>
                </div>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-zinc-700 group">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

        </CardContent>

        <CardFooter>
          <Button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-6"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
            ) : (
              "Post Item"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}