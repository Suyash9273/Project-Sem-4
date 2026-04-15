"use client";

import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; // Better for descriptions
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImagePlus, RefreshCcw, X, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useItemsStore } from "@/app/store/items-store";

export interface UserProp {
  id: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SellItemFormProps {
  user: UserProp | null;
}

type TradeType = "SELL" | "FREE" | "NEGOTIABLE";

const SellItemForm = ({ user, setOpen }: SellItemFormProps & { setOpen: (open: boolean) => void }) => {
  const [title, setTitle] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [priceError, setPriceError] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [tradeType, setTradeType] = useState<TradeType | undefined>(undefined);
  const [tradeTypeError, setTradeTypeError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const addItem = useItemsStore((state) => state.addItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTitleError("");
    setDescriptionError("");
    setImageError("");
    setTradeTypeError("");
    setPriceError("");

    let isValid = true;

    if (!title.trim()) { setTitleError("Title is required"); isValid = false; }
    if (!description.trim()) { setDescriptionError("Description is required"); isValid = false; }
    if (images.length === 0) { setImageError("At least one image is required"); isValid = false; }
    if (!tradeType) { setTradeTypeError("Trade type is required"); isValid = false; }
    if (tradeType === "SELL" && (price === undefined || price <= 0)) {
      setPriceError("Valid price is required");
      isValid = false;
    }

    if (!isValid) return;

    if (!user) {
      toast.error("Authentication required to list items.");
      return;
    }

    setOpen(false);
    toast.success("Listing created successfully!");

    await addItem(
      {
        title,
        description,
        price: tradeType === "SELL" ? price : 0,
        images,
        tradeType: tradeType as string,
      },
      {
        id: user.id,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
      }
    );
  };

  const refreshForm = () => {
    setTitle(""); setDescription(""); setPrice(undefined);
    setImages([]); setTradeType(undefined);
    setTitleError(""); setDescriptionError(""); setPriceError("");
    setTradeTypeError(""); setImageError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-4 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header - Styled like a system sub-header */}
      <div className="flex items-center justify-between border-b-[3px] border-black pb-4 bg-[#ccfbf1] -m-4 mb-4 p-4">
        <div className="flex items-center gap-2 text-black">
          <Info className="w-5 h-5 stroke-[3px]" />
          <span className="text-sm font-black uppercase tracking-tighter">Item Specifications</span>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={refreshForm} 
          className="h-9 w-9 border-2 border-black rounded-none hover:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <RefreshCcw className="w-4 h-4 stroke-[3px]" />
        </Button>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-black/70">Item Title</Label>
          <Input
            id="title"
            placeholder="e.g. LAB COAT, ENGINEERING MATH"
            value={title}
            className="rounded-none border-[3px] border-black bg-zinc-50 focus-visible:ring-0 focus-visible:border-[#22d3ee] font-bold placeholder:text-zinc-400"
            onChange={(e) => setTitle(e.target.value)}
          />
          {titleError && <p className="text-red-600 text-[10px] font-black uppercase bg-red-50 p-1 border border-red-200">{titleError}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-black/70">Description</Label>
          <Textarea
            id="description"
            placeholder="Condition, usage, etc."
            className="rounded-none border-[3px] border-black bg-zinc-50 min-h-[100px] focus-visible:ring-0 focus-visible:border-[#22d3ee] font-medium"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {descriptionError && <p className="text-red-600 text-[10px] font-black uppercase bg-red-50 p-1 border border-red-200">{descriptionError}</p>}
        </div>

        {/* Trade Type & Price */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-black/70">Trade Type</Label>
            <Select value={tradeType} onValueChange={(value) => setTradeType(value as TradeType)}>
              <SelectTrigger className="rounded-none border-[3px] border-black bg-zinc-50 font-bold">
                <SelectValue placeholder="SELECT" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <SelectItem value="SELL" className="font-bold">SELL</SelectItem>
                <SelectItem value="FREE" className="font-bold">FREE</SelectItem>
                <SelectItem value="NEGOTIABLE" className="font-bold">NEGOTIABLE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tradeType === "SELL" && (
            <div className="space-y-2 animate-in fade-in zoom-in-95">
              <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-black/70">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                className="rounded-none border-[3px] border-black bg-zinc-50 font-black text-lg"
                value={price === undefined ? "" : price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-xs font-black uppercase tracking-widest text-black/70">Visual Proof (Photos)</Label>
          <div className="flex flex-wrap gap-3 p-4 border-[3px] border-dashed border-black bg-zinc-50/50">
            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square w-20 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <button
                  type="button"
                  className="absolute -top-2 -right-2 z-10 bg-black text-white p-1 hover:bg-red-600 transition-colors"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <X className="w-3 h-3 stroke-[3px]" />
                </button>
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
              </div>
            ))}
            
            <button 
              type="button"
              className="w-20 h-20 border-[3px] border-dashed border-black flex flex-col items-center justify-center gap-1 bg-white hover:bg-[#facc15] transition-all group"
              onClick={() => setOpenDialog(true)}
            >
              <ImagePlus className="w-6 h-6 text-black" />
              <span className="text-[8px] font-black uppercase">Add File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest h-14 rounded-none border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        Finalize & Post Listing
      </Button>

      {/* Custom File Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-white border-[4px] border-black rounded-none shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
          <div className="bg-[#facc15] p-4 border-b-4 border-black font-black uppercase tracking-widest text-black">
            File Explorer
          </div>
          <div className="p-8">
             <Input
              type="file"
              multiple
              accept="image/*"
              className="rounded-none border-2 border-black bg-zinc-50 cursor-pointer file:bg-black file:text-white file:font-black file:uppercase file:px-4 file:mr-4 file:border-none"
              onChange={(e) => {
                if (e.target.files) {
                  setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
                  setOpenDialog(false);
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default SellItemForm;