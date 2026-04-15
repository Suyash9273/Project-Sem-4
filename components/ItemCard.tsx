"use client";

import React, { use, useEffect, useState } from "react";
import {
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
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
import { useUser } from "@/app/store/user";
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
  // Optional: Pass the full seller object if you have it from the join
  seller?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ItemCardProps {
  item: Item;
  isOwner?: boolean; // To conditionally show edit/report options
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

export default function ItemCard({ item, isOwner }: ItemCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addRequest, deleteRequest, requestStatuses, fetchRequestStatuses } = useRequestStore();
  const { user, init } = useUser();
  const router = useRouter()
  const myStatus = requestStatuses[item.id] || "none";

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < item.image_urls.length - 1) setCurrentImageIndex(prev => prev + 1);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
  };

  useEffect(() => {
    if (!user) init();
    fetchRequestStatuses({ userId: user?.id });
  }, [user?.id]);

  return (
    <Card className="w-full max-w-md overflow-hidden transition-all duration-200 group bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-white rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">

      {/* Header - Retro Mint/White */}
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-3 border-b-[3px] border-black dark:border-white bg-[#ccfbf1] dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-black rounded-none">
            <AvatarImage src={item.seller?.avatar_url || ""} className="rounded-none" />
            <AvatarFallback className="bg-white text-black font-black rounded-none">
              {item.seller?.full_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-tighter text-black dark:text-white leading-none">
              {item.seller?.full_name || "Unknown Seller"}
            </span>
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
          <DropdownMenuContent align="end" className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <DropdownMenuItem className="font-bold uppercase text-xs" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              <Share2 className="w-4 h-4 mr-2" /> Share Link
            </DropdownMenuItem>
            {isOwner && <DropdownMenuItem className="text-destructive font-bold uppercase text-xs">Edit Listing</DropdownMenuItem>}
            {!isOwner && <DropdownMenuItem className="text-destructive font-bold uppercase text-xs">Report Item</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Image Gallery */}
      <div className="relative aspect-square w-full bg-zinc-200 dark:bg-zinc-800 border-b-[3px] border-black dark:border-white overflow-hidden">
        {item.image_urls.length > 0 ? (
          <img
            src={item.image_urls[currentImageIndex]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black font-black uppercase italic">No Image</div>
        )}

        {/* Status Overlay - Retro Style Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`
            rounded-none border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
            ${item.status === 'AVAILABLE' ? 'bg-[#22c55e]' : ''}
            ${item.status === 'SOLD' ? 'bg-red-500' : ''}
            ${item.status === 'RESERVED' ? 'bg-[#facc15]' : ''}
            text-black px-3 py-1 font-black text-[10px] uppercase tracking-widest
          `}>
            {item.status}
          </Badge>
        </div>

        {/* Retro Navigation Arrows */}
        {item.image_urls.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            <Button
              variant="secondary" size="icon"
              className={`pointer-events-auto h-10 w-10 rounded-none bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${currentImageIndex === 0 ? 'invisible' : ''}`}
              onClick={prevImage}
            >
              <ChevronLeft className="w-6 h-6 text-black" />
            </Button>
            <Button
              variant="secondary" size="icon"
              className={`pointer-events-auto h-10 w-10 rounded-none bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${currentImageIndex === item.image_urls.length - 1 ? 'invisible' : ''}`}
              onClick={nextImage}
            >
              <ChevronRight className="w-6 h-6 text-black" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 pb-2 bg-white dark:bg-zinc-950">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-black text-lg uppercase tracking-tighter text-black dark:text-white line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-[#7C3AED] dark:text-[#a78bfa] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                {formatPrice(item.price, item.type)}
              </span>
              <Badge variant="outline" className="rounded-none text-[9px] h-5 border-2 border-black bg-[#f3f4f6] text-black font-black uppercase tracking-tighter">
                {item.type}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-none border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-100 group">
            <Heart className="w-5 h-5 text-black group-hover:fill-red-500 transition-colors" />
          </Button>
        </div>
        <p className="text-black/80 dark:text-white/80 text-xs font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
          {item.description}
        </p>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="p-4 pt-2 bg-white dark:bg-zinc-950">
        {item.status === 'AVAILABLE' ? (
          myStatus === 'none' ? (
            <Button
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black uppercase tracking-widest h-12 rounded-none border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              onClick={() => addRequest({ itemId: item.id })}
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Request to Buy
            </Button>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between px-1 border-2 border-black p-2 bg-zinc-100">
                <span className="text-[10px] font-black text-black uppercase tracking-widest">Status:</span>
                <Badge className="bg-black text-white rounded-none font-black text-[10px] uppercase">
                  {myStatus}
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full border-2 border-black rounded-none bg-red-400 text-black hover:bg-red-500 h-10 font-black text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                onClick={() => deleteRequest({ itemId: item.id })}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Cancel Request
              </Button>
            </div>
          )
        ) : (
          <div className="w-full">
            {myStatus === 'ACCEPTED' ? (
              <Button className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest h-12 rounded-none border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all" onClick={() => router.push(`/chat/${item.id}`)}>
                <MessageCircle className="w-5 h-5 mr-2" /> Open Chat
              </Button>
            ) : (
              <div className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 rounded-none text-center text-xs font-black uppercase tracking-[0.2em] text-black/40 border-2 border-black">
                {item.status}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}