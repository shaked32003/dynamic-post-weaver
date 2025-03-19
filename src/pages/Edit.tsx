
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import Header from "@/components/layout/Header";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contentAPI, authAPI } from "@/services/api";
import { isAuthenticated } from "@/lib/utils";
import { Post, SavePostPayload } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const Edit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<SavePostPayload>({
    title: "",
    content: "",
    topic: "",
    style: "",
  });

  // Check authentication status
  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const fetchedPost = await contentAPI.getPostById(id);
        setPost(fetchedPost);
        setFormData({
          id: fetchedPost.id,
          title: fetchedPost.title,
          content: fetchedPost.content,
          topic: fetchedPost.topic,
          style: fetchedPost.style,
          isPublished: fetchedPost.isPublished,
        });
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuth && id) {
      fetchPost();
    }
  }, [id, isAuth, navigate]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    setIsSaving(true);

    try {
      await contentAPI.savePost(formData);
      toast.success("Post saved successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header isAuthenticated={true} onLogout={handleLogout} />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center">
              <CustomButton
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="mr-2"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </CustomButton>
              <h1 className="text-2xl font-bold font-display">Edit content</h1>
            </div>

            <CustomButton
              onClick={handleSave}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              <Save size={16} className="mr-2" />
              Save changes
            </CustomButton>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="edit">
              <TabsList className="mb-6">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      placeholder="E.g., Technology, Health, Business"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Input
                      id="style"
                      value={formData.style}
                      onChange={handleInputChange}
                      placeholder="E.g., Professional, Casual, Technical"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your content in Markdown format"
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="glassmorphism p-8 rounded-lg shadow-md">
                  <h1 className="text-3xl font-bold mb-6">{formData.title}</h1>
                  <article className="prose prose-stone dark:prose-invert max-w-none">
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  </article>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Edit;
