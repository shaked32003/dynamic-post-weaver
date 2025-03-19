
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Edit, Trash, Share, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import { CustomButton } from "@/components/ui/custom-button";
import { contentAPI, authAPI } from "@/services/api";
import { formatDate, isAuthenticated, truncateText } from "@/lib/utils";
import { Post } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const isAuth = isAuthenticated();

  // Check authentication status
  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userPosts = await contentAPI.getUserPosts();
        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load your content");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuth) {
      fetchPosts();
    }
  }, [isAuth]);

  const handleDeletePost = async (postId: string) => {
    try {
      setDeletingPostId(postId);
      await contentAPI.deletePost(postId);
      setPosts(posts.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handlePublishToggle = async (post: Post) => {
    try {
      const updatedPost = await contentAPI.publishPost(post.id, !post.isPublished);
      setPosts(
        posts.map((p) => (p.id === post.id ? updatedPost : p))
      );
      toast.success(post.isPublished ? "Post unpublished" : "Post published");
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("Failed to update post status");
    }
  };

  const handleSharePost = (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header isAuthenticated={true} onLogout={handleLogout} />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Your Content</h1>
            <p className="text-muted-foreground">
              Manage your generated blog posts
            </p>
          </div>

          <CustomButton
            onClick={() => navigate("/generate")}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Create new content
          </CustomButton>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="border">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="glassmorphism p-8 rounded-xl max-w-md">
              <h2 className="text-xl font-semibold mb-2">No content yet</h2>
              <p className="text-muted-foreground mb-6">
                Start by creating your first AI-generated blog post.
              </p>
              <CustomButton onClick={() => navigate("/generate")}>
                <Plus size={16} className="mr-2" />
                Create content
              </CustomButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="border transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant={post.isPublished ? "default" : "outline"}>
                      {post.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.updatedAt)}
                    </span>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    Topic: {post.topic} • Style: {post.style}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {truncateText(post.content.replace(/[#*]/g, ""), 150)}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2 flex-wrap">
                  <div className="flex gap-2">
                    <Link to={`/edit/${post.id}`}>
                      <CustomButton variant="outline" size="sm">
                        <Edit size={14} className="mr-1" />
                        Edit
                      </CustomButton>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <CustomButton variant="outline" size="sm">
                          <Trash size={14} className="mr-1" />
                          Delete
                        </CustomButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePost(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingPostId === post.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex gap-2">
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublishToggle(post)}
                    >
                      {post.isPublished ? "Unpublish" : "Publish"}
                    </CustomButton>

                    {post.isPublished && (
                      <div className="flex gap-2">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleSharePost(post.id)}
                        >
                          <Share size={14} className="mr-1" />
                          Share
                        </CustomButton>

                        <Link to={`/post/${post.id}`} target="_blank">
                          <CustomButton variant="ghost" size="sm">
                            <ExternalLink size={14} />
                          </CustomButton>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
