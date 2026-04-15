import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const searchParams = new URL(request.url).searchParams;
        const itemId = searchParams.get('itemId');
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        if(!itemId){
            return NextResponse.json({
                success : false,
                message : "Missing itemId"
            },{status:400})
        }
        const { data, error } = await supabase
        .from('items')
        .select('id')
        .eq('id', itemId)
        .eq('buyer_id', user.id)
        .maybeSingle();
        const isAccepted = !!data;
        return NextResponse.json({
            success : true,
            isAccepted : isAccepted
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Error checking if item is accepted"
        },{status:500})
    }
}