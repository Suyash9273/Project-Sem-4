import React from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import LogoutButton from '@/components/Logout'
const page = () => {
    return (
        <div className='space-y-5 space-x-2 flex'>
            <ScrollArea className="min-h-screen w-1/6 rounded-md border p-4">
                <div className="absolute bottom-4 right-4">
                    <LogoutButton />
                </div>
                
            </ScrollArea>
            <h1 className='text-center text-2xl font-bold p-2'>Welcome to Dashboard</h1>
        </div>
    )
}

export default page
