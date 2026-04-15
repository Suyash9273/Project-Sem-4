import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const body=await request.json()
        const {messageId}=body
        if(!messageId){
            return NextResponse.json({
                success : false,
                message : "Message Id is required"
            }, { status: 400 })
        }
        const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
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