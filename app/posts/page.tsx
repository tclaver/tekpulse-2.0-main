"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShareDialog from "@/components/ShareDialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import moment from "moment";

import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Users,
  Bookmark,
  Send,
  X,
  Plus,
  Crown,
  Star,
  UserCheck,
  Trash2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function PostsPage() {
  const router = useRouter();
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<any>([]);
  const [comments, setComments] = useState<any>([]);
  const [newPost, setNewPost] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [postingError, setPostingError] = useState<string | null>(null);
  const [postsToSkip, setPostsToSkip] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any>([]);
  const [trendingTags, setTrendingTags] = useState<any>([]);
  const [isEventsDialogOpen, setIsEventsDialogOpen] = useState(false);
  /*Share Pieces*/ 
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState<any>([]);
  const currentUrl =
  typeof window !== "undefined" ? window.location.href : "";
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  


  const getLevelIcon = (level: string) => {
    switch (level) {
      case "president":
        return Crown;
      case "secretary":
        return Star;
      case "representative":
        return UserCheck;
      default:
        return Users;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "president":
        return "text-yellow-600";
      case "secretary":
        return "text-blue-600";
      case "representative":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getTags = (text: string) => {
    const matches = text.match(/#(\w+)/g);
    return matches ? matches.map((match) => match.slice(1)) : [];
  };

  const handleLike = async (postId: number) => {
    const post = posts.find((post: any) => post.id === postId);
    const isLiked = post?.users_liked?.some(
      (like: any) => like.user_id === user.id
    );
    if (!isLiked) {
      const { data, error } = await supabase.from("likes").insert({
        post_id: postId,
        user_id: user.id,
      });

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      if (error) {
        console.error(error);
        return;
      }
    }

    setPosts(
      posts.map((post: any) =>
        post.id === postId
          ? {
              ...post,
              users_liked: isLiked
                ? post.users_liked.filter(
                    (like: any) => like.user_id !== user.id
                  )
                : [...post.users_liked, { user_id: user.id }],
              likes: [
                {
                  count: isLiked
                    ? post.likes?.[0]?.count - 1
                    : post.likes?.[0]?.count + 1,
                },
              ],
            }
          : post
      )
    );
  };


  const handleShare = (postId: number) => {
    setPosts(
      posts.map((post: any) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    );
    // In a real app, this would open a share dialog
    console.log("Sharing post:", postId);
  };

  const handleDeletePost = async (postId: number) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error(error);
    } else {
      setPosts(posts.filter((post: any) => post.id !== postId));
    }
  };

  async function getUserProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (data) {
        setUser(data);
      }
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async () => {
    if (newPost.trim() || selectedImage) {
      const content = newPost.trim();
      setIsPosting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      let publicUrl: null | string = null;

      if (selectedImage) {
        const fileExt = selectedImage?.name.split(".").pop();
        const { data: imagePreview, error: uploadError } =
          await supabase.storage
            .from("post-images")
            .upload(
              `${user.id}/${Date.now()}.${fileExt}`,
              selectedImage as File
            );

        if (uploadError) {
          setIsPosting(false);
          console.error(uploadError);
          return;
        }

        let data = supabase.storage
          .from("post-images")
          .getPublicUrl(imagePreview.path);

        publicUrl = data.data.publicUrl;
      }

      const { data, error } = await supabase.from("posts").insert({
        content: content,
        author_id: user?.id,
        image_url: publicUrl,
      });

      if (error) {
        setIsPosting(false);
        setPostingError(error.message);
        return;
      }

      setIsPosting(false);
      setNewPost("");
      removeImage();
      setIsCreateDialogOpen(false);
      setPostsToSkip(0);
      getPosts();
    }
  };

  

  const handleCreateComment = async () => {
    const content = newComment.trim();

    setIsCommenting(true);

    if (content) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase.from("comments").insert({
        content: content,
        post_id: selectedPost,
        author_id: user.id,
      });

      if (error) {
        setIsCommenting(false);
        console.error(error);
        return;
      }

      setNewComment("");
      getComments();

      // Update comment count in posts
      setPosts(
        posts.map((post: any) =>
          post.id === selectedPost
            ? {
                ...post,
                comments: [{ count: (post.comments?.[0]?.count || 0) + 1 }],
              }
            : post
        )
      );

      setIsCommenting(false);
    }
  };

  const getComments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:profiles (
          id,
          full_name,
          student_id,
          profile_pic,
          positions:member_positions(
            id,
            title,
            level,
            approved
          )
        )
        `
      )
      .eq("post_id", selectedPost)
      .eq("author.positions.approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const formattedComments = data.map((comment: any) => ({
        ...comment,
        author: {
          ...comment.author,
          position: comment.author.positions?.[0] || null,
        },
      }));
      setComments(formattedComments);
    }
  };

  {/* Bookmark Function*/}

  const handleBookmark = async (postId: number) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be logged in to bookmark posts.");
    return;
  }

  // Check if bookmark exists
  const { data: existing, error: checkError } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (checkError) {
    console.error(checkError);
    return;
  }

  if (existing) {
    // remove bookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id);

    if (!error) {
      setPosts((prev: any[]) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isBookmarked: false } : p
        )
      );
    }
  } else {
    // add bookmark
    const { error } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      post_id: postId,
    });

    if (!error) {
      setPosts((prev: any[]) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isBookmarked: true } : p
        )
      );
    }
  }
};


const getPosts = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(
      `
        *,
        author:profiles!posts_author_id_fkey(id, student_id, full_name, profile_pic),
        bookmarks(user_id)
      `
    )
    .order("created_at", { ascending: false })
    .range(postsToSkip, postsToSkip + 4);

  const { data, error } = await query;

  if (!error && data) {
    const postsWithBookmark = data.map((post: any) => ({
      ...post,
      isBookmarked: user
        ? post.bookmarks.some((b: any) => b.user_id === user.id)
        : false,
    }));

    setPosts((prev: any[]) =>
      postsToSkip === 0 ? postsWithBookmark : [...prev, ...postsWithBookmark]
    );
  } else if (error) {
    console.error("Error fetching posts:", error.message);
  }
};




  const PostCard = ({ post }: { post: any }) => (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="ring-2 ring-purple-200 shadow-md">
              {post.author?.profile_pic ? (
                <img
                  src={post.author.profile_pic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                  {post.author?.full_name?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-lg">{post.author?.full_name}</h4>
                {post?.author?.position && (
                  <>
                    {(() => {
                      const LevelIcon = getLevelIcon(
                        post.author.position.level
                      );
                      return (
                        <div className="p-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                          <LevelIcon className="h-3 w-3 text-white" />
                        </div>
                      );
                    })()}
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-sm">
                      {post.author.position.title}
                    </Badge>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="font-medium">{post.author.student_id}</span>
                <span>•</span>
                <span className="font-medium">
                  {moment(post.created_at).fromNow()}
                </span>
                {post.community && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className="text-xs border-purple-200 text-purple-700"
                    >
                      {post.community.name}
                    </Badge>
                  </>
                )}
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-purple-500" />
                      <span>{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user?.is_admin && (
                <DropdownMenuItem
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-base leading-relaxed mb-4 text-slate-700 dark:text-slate-200">
            {post.content}
          </p>

          {/* Tags */}
          {getTags(post.content).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {getTags(post.content).map((tag: string) => (
                <Badge
                  key={tag}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => setViewImageUrl(post.image_url)}
            />
          </div>
        )}


        {/* Event Card */}
        {post.event && (
          <Card className="mb-4 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm">{post.event.title}</h5>
                  <p className="text-xs text-muted-foreground font-medium">
                    {post.event.date}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.event.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post Actions */}
<div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
  {/* Like button */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleLike(post.id)}
  >
    <Heart
      className={`h-4 w-4 mr-1 ${
        post.users_liked?.some((like: any) => like.user_id === user?.id)
          ? "text-red-500 fill-red-500"
          : ""
      }`}
    />
    {post.likes?.[0]?.count || 0}
  </Button>

  {/* Comment button */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setSelectedPost(post.id)}
  >
    <MessageCircle className="h-4 w-4 mr-1" />
    {post.comments?.[0]?.count || 0}
  </Button>

  {/* Share button */}
  <Button
  variant="ghost"
  size="sm"
  onClick={() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/posts/${post.id}`);
    }
    setShareOpen(true);
  }}
>
  <Share className="h-4 w-4 mr-1" />
  Share
</Button>


  {/* Bookmark button */}
  <Button
  variant="ghost"
  size="sm"
  onClick={() => handleBookmark(post.id)}
>
  <Bookmark
    className={`h-4 w-4 mr-1 ${
      post.isBookmarked ? "text-purple-600 fill-purple-600" : ""
    }`}
  />
  {post.isBookmarked ? "Bookmarked" : "Bookmark"}
</Button>

</div>
      </CardContent>
    </Card>
  );

  async function getRecentActivity() {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        actor:profiles!activities_actor_id_fkey(full_name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error(error);
    } else {
      setRecentActivity(data || []);
    }
  }

  useEffect(() => {
    getUserProfile();
    getPosts();
  }, []);

  const getTrendingHashtags = () => {
    const tagCounts: { [key: string]: number } = {};
    
    posts.forEach((post: any) => {
      const hashtags = post.content.match(/#(\w+)/g) || [];
      hashtags.forEach((tag: string) => {
        const cleanTag = tag.toLowerCase();
        tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag: tag.slice(1), posts: count }));
    
    setTrendingTags(sorted);
  };

  async function getUpcomingEvents() {
    const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true }).limit(10);
    if (error) {
      console.error(error);
    } else {
      setUpcomingEvents(data || []);
    }
  }

  useEffect(() => {
    if (user) {
      getRecentActivity();
      getUpcomingEvents();
    }
  }, [user]);

  useEffect(() => {
    if (posts.length > 0) {
      getTrendingHashtags();
    }
  }, [posts]);

  useEffect(() => {
    if (selectedPost) {
      getComments();
    }
  }, [selectedPost]);

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:block lg:col-span-3">
              <div className="w-full sticky top-0 flex flex-col items-center h-[calc(100vh-2rem)] overflow-y-auto space-y-6">
                {/* Trending Topics */}
                <Card className="border-0 sticky w-64 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 mr-3">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      Trending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingTags.map((trend: any, index: number) => (
                      <div
                        key={trend.tag}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-blue-600">
                            #{trend.tag}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {trend.posts} posts
                        </span>
                      </div>
                    ))}
                    {trendingTags.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No trending tags yet
                      </div>
                    )}
                  </CardContent>
                </Card>
                

                {/* Quick Stats */}
                <Card className="border-0 w-64 shadow-xl bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mr-3">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        1,247
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Students
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        89
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Posts Today
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6 space-y-8">
              {/* Hero Header */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-8 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 right-4 opacity-30">
                  <Sparkles className="h-20 w-20" />
                </div>
                <div className="relative z-10">
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Campus Feed
                  </h1>
                  <p className="text-purple-100 text-lg">
                    Share updates and connect with fellow students
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Create a Post
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Share something with your fellow students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
                        <Avatar className="ring-2 ring-purple-200">
                          {user?.profile_pic ? (
                            <img
                              src={user.profile_pic}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {user?.full_name?.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="What's happening on campus?"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            rows={4}
                            className="resize-none border-none p-0 focus-visible:ring-0 text-lg bg-transparent placeholder:text-muted-foreground/70"
                          />
                        </div>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative mt-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full max-h-64 object-cover rounded-xl shadow-lg"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {postingError && (
                        <p className="text-red-500 text-sm">{postingError}</p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-purple-100"
                            asChild
                          >
                            <label className="cursor-pointer">
                              <ImageIcon className="h-4 w-4 text-purple-600" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                              />
                            </label>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-purple-100"
                          >
                            <MapPin className="h-4 w-4 text-purple-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-purple-100"
                          >
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-sm font-medium ${
                              280 - newPost.length < 20
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {280 - newPost.length}
                          </span>
                          <Button
                            onClick={handleCreatePost}
                            disabled={
                              (!newPost.trim() && !selectedImage) ||
                              newPost.length > 280 ||
                              isPosting
                            }
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg"
                          >
                            {isPosting ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Quick Post */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="ring-2 ring-purple-200 shadow-lg">
                      {user?.profile_pic ? (
                        <img
                          src={user.profile_pic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                          {user?.full_name?.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="What's happening on campus? Share your thoughts..."
                        onClick={() => setIsCreateDialogOpen(true)}
                        readOnly
                        className="resize-none cursor-pointer border-2 border-purple-100 hover:border-purple-200 focus:border-purple-300 transition-colors bg-white/50 backdrop-blur-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts?.map((post: any) => (
                 <PostCard
                  key={post.id}
                  post={post}
                  onBookmarkToggle={handleBookmark} // ✅ correct
                />


                ))}
              </div>
                {/* Image Viewing*/}

                 {/* Image Viewer Dialog */}
        <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
          <DialogContent className="p-0 max-w-2xl flex items-center justify-center bg-transparent shadow-none">
            {viewImageUrl && (
              <img
                src={viewImageUrl}
                alt="Full View"
                className="rounded-xl max-h-[80vh] w-auto object-contain mx-auto"
                onClick={() => setViewImageUrl(null)}
                style={{ cursor: "zoom-out" }}
              />
            )}
          </DialogContent>
        </Dialog>

              {/* Load More */}
              {hasMorePosts && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLoadingMore(true);
                      setPostsToSkip((prev) => prev + 5);
                      getPosts(true).finally(() => setLoadingMore(false));
                    }}
                    disabled={loadingMore}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loadingMore ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Load More Posts
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Comments Dialog */}
              <Dialog
                open={selectedPost !== null}
                onOpenChange={() => setSelectedPost(null)}
              >
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto border-0 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Comments
                    </DialogTitle>
                  </DialogHeader>
                  {selectedPost && (
                    <div className="space-y-4">
                      {/* Original Post */}
                      <div className="pb-4 border-b">
                        <PostCard
                          post={posts.find((p: any) => p.id === selectedPost)}
                        />
                      </div>

                      {/* Comments */}
                      <div className="space-y-4">
                        {comments?.map((comment: any) => (
                          <div
                            key={comment.id}
                            className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <Avatar className="h-8 w-8 ring-2 ring-purple-200">
                              {comment.author.profile_pic ? (
                                <img
                                  src={comment.author.profile_pic}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {comment.author.full_name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold text-sm">
                                  {comment.author.full_name}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                  {moment(comment.created_at).fromNow()}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      <div className="flex items-start space-x-3 pt-4 border-t border-purple-100">
                        <Avatar className="h-8 w-8 ring-2 ring-purple-200">
                          {user?.profile_pic ? (
                            <img
                              src={user.profile_pic}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {user?.full_name?.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 flex space-x-2">
                          <Input
                            placeholder="Write a comment... "
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 border-2 border-purple-100 focus:border-purple-300 rounded-full"
                          />
                          <Button
                            size="sm"
                            disabled={!newComment || isCommenting}
                            onClick={() => {
                              handleCreateComment();
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 rounded-full shadow-lg"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              
              
              {/* Events Dialog */}
              <Dialog open={isEventsDialogOpen} onOpenChange={setIsEventsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Campus Events
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      {upcomingEvents.map((event: any) => (
                        <div
                          key={event.id}
                          className="flex items-start space-x-4 p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold mb-2">{event.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{event.date}</span>
                              <span>•</span>
                              <span>{event.time}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingEvents.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No events available
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            {/* Right Sidebar */}
            <div className="lg:block lg:col-span-3">
              <div className="w-full sticky top-0 flex flex-col items-center h-[calc(100vh-2rem)] overflow-hidden hover:overflow-y-auto space-y-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-slate-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 mr-3">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto hover:bg-orange-50 dark:hover:bg-slate-700 transition-all duration-200 group"
                      onClick={() => router.push('/communities')}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mr-3 group-hover:scale-110 transition-transform">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Communities</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto hover:bg-orange-50 dark:hover:bg-slate-700 transition-all duration-200 group"
                      onClick={() => setIsEventsDialogOpen(true)}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mr-3 group-hover:scale-110 transition-transform">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Campus Events</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto hover:bg-orange-50 dark:hover:bg-slate-700 transition-all duration-200 group"
                      onClick={() => router.push('/lost-found')}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mr-3 group-hover:scale-110 transition-transform">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Lost & Found</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto hover:bg-orange-50 dark:hover:bg-slate-700 transition-all duration-200 group"
                      onClick={() => router.push('/messages')}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 mr-3 group-hover:scale-110 transition-transform">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Messages</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-slate-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 mr-3">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentActivity.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-pink-200">
                          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs">
                            {activity.actor?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              {activity.description}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {moment(activity.created_at).fromNow()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <div className="w-64 text-center py-4 text-muted-foreground text-sm">
                        No recent activity
                      </div>
                    )}
                  </CardContent>
                </Card>
                    {/* Share Code */}

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
          navigator.clipboard.writeText(shareUrl)
          alert("Link copied to clipboard!")
          setShareOpen(false)
        }}
      >
        Copy Link
      </Button>
      <Button
        className="w-full"
        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${currentUrl}`, "_blank")}
      >
        Share on Twitter
      </Button>
      <Button
        className="w-full"
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, "_blank")}
      >
        Share on Facebook
      </Button>
      <Button
  className="w-full"
  onClick={() =>
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, "_blank")
  }
>
  Share on WhatsApp
</Button>

    </div>
  </DialogContent>
</Dialog>

                {/* Suggested Connections */}
                {/* <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-slate-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 mr-3">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      Connect
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        name: "Alex Chen",
                        dept: "Computer Science",
                        mutual: 5,
                      },
                      { name: "Lisa Park", dept: "Business Admin", mutual: 3 },
                      { name: "David Kim", dept: "Engineering", mutual: 8 },
                    ].map((person, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 dark:bg-slate-700"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 ring-2 ring-indigo-200">
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs">
                              {person.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{person.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {person.dept}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 border-0 text-xs px-3"
                        >
                          Follow
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
