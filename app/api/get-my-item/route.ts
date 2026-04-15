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
        
        const { data: items, error } = await supabase
        .from('items')
        .select(`
            *,
            seller:profiles!items_seller_id_fkey (
                full_name,
                avatar_url
            )
        `)
        .eq('seller_id', user.id) // Filters for only the current user's items
        .order('created_at', { ascending: false });

        if(error){
            return NextResponse.json({
                success : false,
                message : "Failed to fetch items",
                error : error.message
            },{status:401})
        }
        return NextResponse.json({
            success : true,
            myItems : items
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Error fetching items"
        },{status:500})
    }
}