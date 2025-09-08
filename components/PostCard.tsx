"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bookmark, Share } from "lucide-react";

interface PostCardProps {
  post: any;
  onBookmarkToggle?: (postId: string) => void;
}

export default function PostCard({ post, onBookmarkToggle }: PostCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4 space-y-2">
        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            {post.author?.profile_pic ? (
              <img
                src={post.author.profile_pic}
                alt={post.author.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <AvatarFallback>
                {post.author?.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{post.author?.full_name}</span>
            <span className="text-xs text-gray-400">Posted on {post.created_at}</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-2">
          <h2 className="font-semibold text-lg">{post.title}</h2>
          <p className="text-sm text-gray-600">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt="Post Image"
              className="mt-2 rounded-md max-h-96 w-full object-cover"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4 mt-3">
          {onBookmarkToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmarkToggle(post.id)}
              className="flex items-center space-x-1"
            >
              <Bookmark
                className={`h-4 w-4 ${post.isBookmarked ? "text-purple-600 fill-purple-600" : ""}`}
              />
              <span>{post.isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
