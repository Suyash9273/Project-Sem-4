import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request : Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const body = await request.json();
        console.log("Adding request for itemId:", body)
        const itemId = await body.itemId;

        console.log("Adding request for itemId:", itemId, "by user:", user.id)

        if(!itemId){
            return NextResponse.json({
                success : false,
                message : "Missing itemId"
            },{status:400})
        }

        // 1. Fetch the seller_id for the specific item
        const { data: item, error: fetchError } = await supabase
        .from('items')
        .select('seller_id')
        .eq('id', itemId)
        .single();

        if (item) {
        // 2. Insert the request using the fetched seller_id
        const { data, error : insertError } = await supabase
            .from('requests')
            .insert([
            {
                item_id: itemId,
                buyer_id: user.id,   // Current user ID
                seller_id: item.seller_id,
                status: 'PENDING'
            }
            ]);
            if(insertError){
                return NextResponse.json({
                    success : false,
                    message : "Failed to add request",
                    error : insertError.message
                },{status:401})
            }
        }else{
            return NextResponse.json({
                success : false,
                message : "Item not found"
            },{status:404})
        }
        return NextResponse.json({
            success : true,
            message : "Request added successfully"
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Error adding request"
        },{status:500})
    }
}