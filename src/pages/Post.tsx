
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Share, ArrowLeft, Clock, Tag } from "lucide-react";
import Header from "@/components/layout/Header";
import { CustomButton } from "@/components/ui/custom-button";
import { contentAPI } from "@/services/api";
import { formatDate, isAuthenticated } from "@/lib/utils";
import { Post as PostType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuth = isAuthenticated();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const fetchedPost = await contentAPI.getPostById(id);
        
        // Only allow viewing published posts unless you're authenticated
        if (!fetchedPost.isPublished && !isAuth) {
          toast.error("This post is not available for public viewing");
          navigate("/");
          return;
        }
        
        setPost(fetchedPost);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, isAuth]);

  const handleSharePost = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header isAuthenticated={isAuth} />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <CustomButton
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </CustomButton>

            <CustomButton
              variant="outline"
              onClick={handleSharePost}
              className="flex items-center"
            >
              <Share size={16} className="mr-2" />
              Share
            </CustomButton>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-40 w-full mt-6" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : post ? (
            <div className="glassmorphism p-8 rounded-xl shadow-md">
              <article className="prose prose-stone dark:prose-invert max-w-none">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag size={14} className="mr-1" />
                    <span>Topic: {post.topic}</span>
                  </div>
                  <Badge variant="outline">{post.style} style</Badge>
                </div>

                <Separator className="my-6" />

                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>
            </div>
          ) : (
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-2">Post not found</h2>
              <p className="text-muted-foreground mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <CustomButton onClick={() => navigate("/")}>
                Return to home
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
