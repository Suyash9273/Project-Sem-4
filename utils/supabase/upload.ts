"use server"
import { createClient } from './server';

export async function uploadImage(file: File) {
    console.log("Uploading file:", file);
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    console.log("Current User:", user) 

  if (!user) {
    console.error("User is NOT logged in. Upload will fail due to RLS.")
    // Depending on your app, you might want to stop here or throw an error
    throw new Error("You must be logged in to upload images.") 
  }

  // 1. Sanitize the file name to avoid issues (spaces, weird chars)
  // We add a timestamp to make it unique so users don't overwrite files.
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${fileName}`

  // 2. Upload the file to the 'item-images' bucket
  const { error: uploadError } = await supabase.storage
    .from('item-images')
    .upload(filePath, file)
  if (uploadError) {
    console.error("Upload failed:", uploadError.message, uploadError)
    throw uploadError
  }
  console.log("No error in upload")
  // 3. Get the Public URL
  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(filePath)

    console.log(data)

  return data.publicUrl
}