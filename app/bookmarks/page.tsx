"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PostCard from "@/components/PostCard";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);

      // ✅ Get session instead of getUser
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setBookmarks([]);
        setLoading(false);
        return;
      }

      const user = session.user;

      // fetch posts joined with bookmarks
      const { data, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("id, posts(*)")
        .eq("user_id", user.id);

      if (bookmarksError) {
        console.error("Error fetching bookmarks:", bookmarksError.message);
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

    fetchBookmarks();
  }, []);

  if (loading) return <p className="p-4">Loading bookmarks...</p>;

  if (bookmarks.length === 0)
    return <p className="p-4">You don’t have any bookmarks yet.</p>;

  return (
    <div className="p-4 grid gap-4">
      {bookmarks.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
