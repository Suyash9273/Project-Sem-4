import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id',user.id)
        .order('created_at', { ascending: false });
        if(error){
            return NextResponse.json({
                success : false,
                message : error.message
            },{status : 401})
        }
        return NextResponse.json({
            success : true,
            message : "Notifications fetched successfully",
            notifications : data
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