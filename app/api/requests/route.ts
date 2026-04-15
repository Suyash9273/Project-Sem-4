import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        if (!itemId) {
            return NextResponse.json({
                success : false,
                message : "Missing itemId"
            },{status : 400})
        }
        const { data: requests, error } = await supabase
        .from('requests')
        .select(`
            id,
            item_id,
            buyer_id,
            offer_price,
            status,
            created_at,
            buyer:profiles!requests_buyer_id_fkey (
                full_name,
                avatar_url
            )
        `)
        .eq('item_id', itemId)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
        if (error) {
            return NextResponse.json({
                success : false,
                message : "Failed to fetch requests",
            }, { status: 400 });
        }
        console.log("Fetched requests:", requests);
        return NextResponse.json({
            success : true,
            message : "Requests fetched successfully",
            requests : requests
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success : false,
            message : "Error fetching requests"
        }, { status: 500 });
    }
}