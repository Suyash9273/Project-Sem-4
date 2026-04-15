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
        console.log("This body dismiss notification : ",body)
        const notificationId=body.notificationId
        const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        if(error){
            console.log(error.message)
            return NextResponse.json({
                success : false,
                message : error.message
            },{status : 401})
        }
        return NextResponse.json({
            success : true,
            message : "Notification Dismissed Successfully"
        },{status : 200})
    } catch (error) {
        if(error instanceof Error){
            console.log(error.message)
            return NextResponse.json({
                success : false,
                message : error.message
            },{status : 500})
        }
    }
}