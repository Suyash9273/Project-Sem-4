import { uploadImage } from "@/utils/supabase/upload"
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server" // Ensure you have this helper

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const price = parseFloat(formData.get('price') as string)
        const tradeType = formData.get('tradeType') as string
        
        console.log("Received Item Data:", { title, description, price, tradeType })

        // 1. Authenticate the User
        // You MUST link this item to a seller. We get the user from the session cookies.
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        console.log("Authenticated User:", user.id)

        // 2. Extract Files
        const files: File[] = []
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('images[') && value instanceof File) {
                files.push(value)
            }
        }
        console.log("Received files for upload:", files.length)

        if (files.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 })
        }

        // 3. Upload Images (FIXED)
        // We use Promise.all to wait for ALL uploads to finish before moving on.
        const uploadPromises = files.map(file => uploadImage(file))
        const imageUrls = await Promise.all(uploadPromises)

        console.log("Uploaded Image URLs:", imageUrls)

        // 4. Insert into Database
        const { data, error } = await supabase
            .from('items')
            .insert({
                title: title,
                description: description,
                price: isNaN(price) ? 0 : price, // Safety check
                type: tradeType,       // Ensure this matches your DB Enum ('SELL', 'FREE', etc.)
                image_urls: imageUrls, // Array of strings
                seller_id: user.id,    // The ID of the logged-in user
                status: 'AVAILABLE'
            })
            .select() // Return the created item data
            .single()

        if (error) {
            console.error("Database Insert Error:", error)
            throw error
        }

        return NextResponse.json({
            success: true,
            message: "Item added successfully",
            data: data
        }, { status: 200 })

    } catch (error: any) {
        console.error("Error in /api/add-item:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}