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
        const {token}=body
        if(!token){
            return NextResponse.json({
                success : false,
                message : "Missing token"
            },{status : 401})
        }
        const { data: profile, error } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('id', user.id)
        .single();
        if(error){
            return NextResponse.json({
                success : false,
                message : "Error fetching profile"
            },{status : 402})
        }
        if(profile.fcm_token!==token){
            const { error: updateError } = await supabase
            .from('profiles')
            .update({ fcm_token: token })
            .eq('id', user.id)
            if(updateError){
                return NextResponse.json({
                    success : false,
                    message : "Error in updating profile"
                },{status : 401})
            }
        }
        return NextResponse.json({
            success : true,
            message : "Token loaded successfully"
        },{status : 200})
    } catch (error) {
        return NextResponse.json({
            success : true,
            message : "Error in loading token"
        },{status : 500})
    }
}