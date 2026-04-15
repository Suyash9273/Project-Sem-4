import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const body=await request.json()
        const {content,itemId}=body
        if(!content || !itemId){
            return NextResponse.json({
                success : false,
                message : "Content and itemId are required"
            }, { status: 400 })
        }
        const { data, error } = await supabase
        .from('messages')
        .insert([
            { 
                content: content, 
                item_id: itemId, 
                sender_id: user.id,
                is_image: false // defaults to false if not provided
            }
        ])
        .select();
        if(error){
            return NextResponse.json({
                success : false,
                message : "Failed to send message",
                error : error.message
            }, { status: 500 })
        }
        return NextResponse.json({
            success : true,
            messageId : data[0].id
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Error sending message"
        }, { status: 500 })
    }
}