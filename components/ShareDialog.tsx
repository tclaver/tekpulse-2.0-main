// components/ShareDialog.tsx
"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
}

export default function ShareDialog({
  open,
  onOpenChange,
  url,
  title = "Check this out!",
}: ShareDialogProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        onOpenChange(false);
      } catch (error) {
        console.error("Share canceled", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        onOpenChange(false);
      } catch (error) {
        console.error("Clipboard copy failed", error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={handleShare}>Share Now</Button>
          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(url);
              alert("Link copied to clipboard!");
              onOpenChange(false);
            }}
          >
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
