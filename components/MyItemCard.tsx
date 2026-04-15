"use client";

import React, { useEffect, useState } from "react";
import {
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Shadcn Badge
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Shadcn Avatar
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"; // Shadcn Card
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useRequestStore } from "@/app/store/request";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useRouter } from "next/navigation";

// --- Types ---
interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  type: "SELL" | "FREE" | "NEGOTIABLE";
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "DELETED";
  created_at: string;
  seller_id: string;
  buyer_id: string;
  // Optional: Pass the full seller object if you have it from the join
  seller?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface MyItemCardProps {
  item: Item;
}

// --- Helper for Date ---
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// --- Helper for Price ---
const formatPrice = (price: number, type: string) => {
  if (type === "FREE") return "Free";
  if (type === "NEGOTIABLE" && price === 0) return "Negotiable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export default function MyItemCard({ item }: MyItemCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { requestsByItem, fetchRequests, acceptRequest, rejectRequest, unreserveItem } = useRequestStore();
  const itemRequests = requestsByItem[item.id] || [];
  const router = useRouter()

  useEffect(() => {
    if (item.status === 'AVAILABLE') {
      fetchRequests({ itemId: item.id });
    }
  }, []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < item.image_urls.length - 1) setCurrentImageIndex(prev => prev + 1);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
  };

  return (
    <Card className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-white rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">

      {/* Header - Retro Cyan Style */}
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-3 border-b-[3px] border-black dark:border-white bg-[#ccfbf1] dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AvatarImage src={item.seller?.avatar_url || ""} className="rounded-none" />
              <AvatarFallback className="bg-white text-black font-black rounded-none">
                {item.seller?.full_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-black text-white rounded-none border-2 border-black p-0.5">
              <UserPlus className="w-2.5 h-2.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-tighter text-black dark:text-white leading-none">Your Listing</span>
            <span className="text-[9px] text-black/60 dark:text-white/60 flex items-center gap-1 mt-1 font-black uppercase">
              <Clock className="w-3 h-3" /> {formatTimeAgo(item.created_at)}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50 border-2 border-transparent hover:border-black rounded-none">
              <MoreHorizontal className="w-4 h-4 text-black dark:text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase text-xs">
            <DropdownMenuItem><Share2 className="w-4 h-4 mr-2" /> Share</DropdownMenuItem>
            <DropdownMenuItem>Edit Item</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 font-black"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Image Gallery */}
      <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800 border-b-[3px] border-black dark:border-white overflow-hidden">
        {item.image_urls.length > 0 ? (
          <img
            src={item.image_urls[currentImageIndex]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black font-black uppercase italic text-xs">No photos uploaded</div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`
            rounded-none border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
            ${item.status === 'AVAILABLE' ? 'bg-[#22c55e]' : 'bg-[#facc15]'}
            text-black px-3 font-black text-[10px] uppercase tracking-widest
          `}>
            {item.status}
          </Badge>
        </div>

        {/* Retro Navigation Buttons */}
        {item.image_urls.length > 1 && (
          <>
            <Button variant="secondary" size="icon" className={`absolute top-1/2 left-2 -translate-y-1/2 h-8 w-8 rounded-none bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${currentImageIndex === 0 ? 'hidden' : ''}`} onClick={prevImage}>
              <ChevronLeft className="w-4 h-4 text-black" />
            </Button>
            <Button variant="secondary" size="icon" className={`absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 rounded-none bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${currentImageIndex === item.image_urls.length - 1 ? 'hidden' : ''}`} onClick={nextImage}>
              <ChevronRight className="w-4 h-4 text-black" />
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 pb-2 bg-white dark:bg-zinc-950">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <h3 className="font-black text-base uppercase tracking-tighter text-black dark:text-white line-clamp-1">{item.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#7C3AED] dark:text-[#a78bfa] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{formatPrice(item.price, item.type)}</span>
              <Badge variant="outline" className="rounded-none text-[9px] h-5 border-2 border-black bg-[#f3f4f6] text-black font-black uppercase tracking-tighter">
                {item.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="p-4 pt-2 bg-white dark:bg-zinc-950">
        {item.status === 'AVAILABLE' ? (
          itemRequests.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black uppercase tracking-widest h-12 rounded-none border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Manage {itemRequests.length} Request{itemRequests.length > 1 ? 's' : ''}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-[4px] border-black rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
                <div className="bg-[#facc15] p-4 border-b-4 border-black font-black uppercase tracking-widest text-black">
                  Pending Requests ({itemRequests.length})
                </div>
                <div className="max-h-[350px] overflow-y-auto space-y-4 p-4">
                  {itemRequests.map((req: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-50 border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-black rounded-none">
                          <AvatarImage src={req.buyer.avatar_url || ""} className="rounded-none" />
                          <AvatarFallback className="font-black text-black bg-white">{req.buyer.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-tighter text-black leading-none">{req.buyer.full_name}</span>
                          <span className="text-[9px] font-bold uppercase text-black/50 mt-1">{formatTimeAgo(req.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          className="h-8 w-8 bg-[#22c55e] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                          onClick={() => acceptRequest({ requestId: req.id, itemId: req.item_id, buyerId: req.buyer_id })}
                        >
                          <CheckCircle2 className="w-5 h-5 text-black" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-8 w-8 bg-red-400 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                          onClick={() => rejectRequest(req.id, req.item_id, req.buyer_id)}
                        >
                          <X className="w-5 h-5 text-black" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-black text-center text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
              No active requests
            </div>
          )
        ) : null}

        {item.status === 'RESERVED' && (
          <div className="flex flex-col w-full gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-tighter bg-[#facc15] border-2 border-black p-2 justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Clock className="w-4 h-4" /> Item is Reserved
            </div>
            <div className="flex gap-2 w-full">
              <Button className="flex-1 bg-black text-white hover:bg-zinc-800 font-black uppercase tracking-widest rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none" onClick={() => router.push(`/chat/${item.id}`)}>
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </Button>
              <Button variant="outline" className="flex-1 border-2 border-black bg-white text-red-600 hover:bg-red-50 font-black uppercase tracking-widest rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none" onClick={() => unreserveItem({ itemId: item.id, buyerId: item.buyer_id })}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}