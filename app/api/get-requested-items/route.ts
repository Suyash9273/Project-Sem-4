import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        // 1. Get IDs of items the user already requested
        
        const { data, error } = await supabase
        .from('requests')
        .select(`
            item_id,
            status,
            items:item_id (
            id,
            title,
            description,
            price,
            image_urls,
            status,
            seller:profiles!items_seller_id_fkey (
                full_name,
                avatar_url
            )
            )
        `)
        .eq('buyer_id', user.id);

        // Extract just the items from the results
        const items = data?.map(request => request.items) || [];

        if(error){
            return NextResponse.json({
                success : false,
                message : "Failed to fetch requested items",
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
            message : "Error fetching requested items"
        },{status:500})
    }
}