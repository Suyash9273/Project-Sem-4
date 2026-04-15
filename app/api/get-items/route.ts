import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request : Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        // 1. Get IDs of items the user already requested
        const { data: userRequests } = await supabase
        .from('requests')
        .select('item_id')
        .eq('buyer_id', user.id);

        const requestedItemIds = userRequests?.map(r => r.item_id) || [];

        // 2. Fetch items excluding those IDs
        let query = supabase
        .from('items')
        .select(`
            *,
            seller:profiles!items_seller_id_fkey (
                full_name,
                avatar_url
            )
        `)
        .eq('status', 'AVAILABLE')
        .neq('seller_id', user.id);

        // Only apply "not in" filter if there are actually requested items
        if (requestedItemIds.length > 0) {
            query = query.not('id', 'in', `(${requestedItemIds.join(',')})`);
        }

        const { data: items, error } = await query.order('created_at', { ascending: false });
        console.log("Fetched items:", items);
        if(error){
            return NextResponse.json({
                success : false,
                message : "Failed to fetch items",
                error : error.message
            },{status:401})
        }
        return NextResponse.json({
            success : true,
            items : items 
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Error fetching items"
        },{status:500})
    }
}