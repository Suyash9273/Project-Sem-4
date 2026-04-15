import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const body=await request.json()
        const {itemId,buyerId}=body;
        console.log("Item Id : ",itemId," Buyer Id : ",buyerId)
        if(!itemId || !buyerId){
            return NextResponse.json({
                success : false,
                message : "Missing itemId or buyerId"
            },{status : 401})
        }
        const { error: itemError } = await supabase
            .from('items')
            .update({ 
                status: 'AVAILABLE', 
                buyer_id: null 
            })
            .eq('id', itemId);

        if (itemError) throw itemError;

        // 2. Update the Request Status
        const { error: requestError } = await supabase
            .from('requests')
            .update({ status: 'REJECTED' })
            .eq('item_id', itemId)
            .eq('buyer_id', buyerId);

        if (requestError) throw requestError;
        return NextResponse.json({
            success : true,
            message : "Item unreserved and request rejected successfully"
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Failed to unreserve item or reject request"
        },{status:500})
    }
}