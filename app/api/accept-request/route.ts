import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
    console.log("Inside accept-request API")
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const body=await request.json();
        const { itemId, buyerId ,requestId} = body;   
        if(!itemId || !buyerId || !requestId){
            return NextResponse.json({
                success : false,
                message : "Missing itemId or buyerId or requestId"
            },{status:400})
        }
        // 1. Update the Item
        const { error: itemError } = await supabase
        .from('items')
        .update({ 
            status: 'RESERVED', 
            buyer_id : buyerId 
        })
        .eq('id', itemId);

        if (itemError) throw itemError;

        // 2. Update the Request
        const { error: requestError } = await supabase
        .from('requests')
        .update({ status: 'ACCEPTED' })
        .eq('id', requestId);

        if (requestError) throw requestError;
        return NextResponse.json({
            success : true,
            message : "Request accepted successfully"
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Failed to accept request"
        },{status:500})
    }
}