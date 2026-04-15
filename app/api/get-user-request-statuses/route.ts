import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request : Request){
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
        }
        const searchParams = new URL(request.url).searchParams;
        const userId = searchParams.get('userId');
        if(!userId){
            return NextResponse.json({ success: false, message: "Missing userId parameter" }, { status: 400 });
        }
        const { data: requests, error } = await supabase
        .from('requests')
        .select('item_id, status')
        .eq('buyer_id', user.id);
        if (error) throw error;

        // Transform array [{item_id: '123', status: 'PENDING'}] 
        // into object {'123': 'PENDING'}
        const statuses = requests.reduce((acc: Record<string, string>, req) => {
            acc[req.item_id] = req.status;
            return acc;
        }, {});
        return NextResponse.json({ success: true, statuses }, { status: 200 });
    } catch (error) {
        console.error("Error fetching request statuses:", error);
        return NextResponse.json({ success: false, message: "Error fetching request statuses" }, { status: 500 });
    }
}