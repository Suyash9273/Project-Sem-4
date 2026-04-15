import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request : Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const searchParams = new URL(request.url).searchParams;
        const itemId = searchParams.get('itemId');
        if(!itemId){
            return NextResponse.json({
                success : false,
                message : "Missing itemId"
            },{status:400})
        }
        const { data, error } = await supabase
        .from('requests')
        .select('id,status') // We only need the ID and status to check existence and status
        .eq('item_id', itemId)
        .eq('buyer_id', user.id)
        .maybeSingle(); // Returns 1 record or null (instead of an error)
        const hasRequested = !!data; // true if record exists, false if null
        const requestStatus = data?.status || "none";
        return NextResponse.json({
            success : true,
            isRequested : hasRequested,
            requestStatus : requestStatus
        },{status:200})
    } catch (error) {
        console.log("Error checking request status:", error);
        return NextResponse.json({
            success : false,
            message : "Error checking request status"
        },{status:500})
    }
}