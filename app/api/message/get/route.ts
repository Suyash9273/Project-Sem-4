import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const { searchParams } = new URL(request.url)
        const itemId = searchParams.get('itemId')
        if(!itemId){
            return NextResponse.json({
                success : false,
                message : "ItemId is required"
            }, { status: 400 })
        }
        const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at');
        console.log("Inside get messages api : ",data)
        if(error){
            return NextResponse.json({
                success : false,
                message : "Failed to get messages",
                error : error.message
            }, { status: 401 })
        }
        return NextResponse.json({
            success : true,
            messages : data
        }, { status: 200 })
    } catch (error) {
        console.log("Error is : ",error)
        return NextResponse.json({
            success : false,
            message : "Error sending message"
        }, { status: 500 })
    }
}