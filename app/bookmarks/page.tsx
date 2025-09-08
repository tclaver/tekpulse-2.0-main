"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PostCard from "@/components/PostCard";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      isBookmarked: true, // always bookmarked here
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

    // remove bookmark
    await supabase
      .from("bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setBookmarks((prev) => prev.filter((p) => p.id !== postId));
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
          onBookmarkToggle={handleBookmark} // allow unbookmark
          showActions={true} // ensures icons appear like posts page
        />
      ))}
    </div>
  );
}
