"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PostCard from "@/components/PostCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Share dialog state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Fetch Bookmarks
  const fetchBookmarks = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .select(`
        id,
        posts(
          *,
          author:profiles(
            id,
            full_name,
            profile_pic,
            student_id
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error.message);
      setLoading(false);
      return;
    }

    const posts = data?.map((b: any) => ({
      ...b.posts,
      isBookmarked: true,
    }));

    setBookmarks(posts || []);
    setLoading(false);
  };

  // Unbookmark handler
  const handleBookmark = async (postId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setBookmarks((prev) => prev.filter((p) => p.id !== postId));
  };

  // Share handler
  const handleShare = (post: any) => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/posts/${post.id}`);
    }
    setShareOpen(true);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  if (loading) return <p className="p-4">Loading bookmarks...</p>;

  if (bookmarks.length === 0)
    return <p className="p-4">You don’t have any bookmarks yet.</p>;

  return (
    <div className="p-4 grid gap-4">
      {bookmarks.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onBookmarkToggle={handleBookmark}
          onShare={handleShare}
          showActions={true}
        />
      ))}

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this post</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
                setShareOpen(false);
              }}
            >
              Copy Link
            </Button>
            <Button
              className="w-full"
              onClick={() =>
                window.open(`https://twitter.com/intent/tweet?url=${shareUrl}`, "_blank")
              }
            >
              Share on Twitter
            </Button>
            <Button
              className="w-full"
              onClick={() =>
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank")
              }
            >
              Share on Facebook
            </Button>
            <Button
              className="w-full"
              onClick={() =>
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`,
                  "_blank"
                )
              }
            >
              Share on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
