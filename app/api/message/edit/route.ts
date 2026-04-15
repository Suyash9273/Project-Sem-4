import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const body=await request.json()
        const {content,messageId}=body
        if(!content || !messageId){
            return NextResponse.json({
                success : false,
                message : "Content and MessageId are required"
            }, { status: 400 })
        }
        const { data, error } = await supabase
        .from('messages')
        .update({ content: content,is_edited : true})
        .eq('id', messageId)
        .select()
        .single();
        if(error){
            return NextResponse.json({
                success : false,
                message : "Failed to send message",
                error : error.message
            }, { status: 401 })
        }
        return NextResponse.json({
            success : true
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Error sending message"
        }, { status: 500 })
    }
}