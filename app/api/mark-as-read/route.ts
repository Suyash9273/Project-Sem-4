import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true }) // The change
        .eq('user_id', user.id)      // Filter for the specific user
        .eq('is_read', false);
        if(error){
            return NextResponse.json({
                success : false,
                message : error.message
            },{status : 401})
        }
        return NextResponse.json({
            success : true,
            message : "All Notifications mark as read successfully"
        },{status : 200})
    } catch (error) {
        if(error instanceof Error){
            return NextResponse.json({
                success : false,
                message : error.message
            },{status : 500})
        }
    }
}