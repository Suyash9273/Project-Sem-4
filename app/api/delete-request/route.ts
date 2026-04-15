import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        // 1. Auth Check
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Get Item ID from URL
        const { searchParams } = new URL(request.url)
        const itemId = searchParams.get('itemId')

        if (!itemId) {
            return NextResponse.json({ success: false, message: "Missing itemId" }, { status: 400 })
        }

        // 3. Delete the request
        // We filter by both item_id AND buyer_id (the current user) 
        // to ensure a user can only delete their own requests.
        const { error: deleteError } = await supabase
            .from('requests')
            .delete()
            .eq('item_id', itemId)
            .eq('buyer_id', user.id);

        if (deleteError) {
            return NextResponse.json({ 
                success: false, 
                message: "Failed to delete request", 
                error: deleteError.message 
            }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: "Request deleted successfully" 
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: "Internal Server Error" 
        }, { status: 500 })
    }
}