"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";

export default function PostCard({ post }: { post: any }) {
  return (
    <Card className="shadow-md">
      <CardContent className="p-4 space-y-2">
        <h2 className="font-semibold text-lg">{post.title}</h2>
        <p className="text-sm text-gray-600">{post.content}</p>
        <div className="text-xs text-gray-400">Posted on {post.created_at}</div>
      </CardContent>
    </Card>
  );
}
