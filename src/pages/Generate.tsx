
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Save, Share } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { contentAPI, authAPI } from "@/services/api";
import { isAuthenticated } from "@/lib/utils";
import { Post, GenerateContentPayload } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const styleOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "storytelling", label: "Storytelling" },
  { value: "persuasive", label: "Persuasive" },
];

const Generate = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<GenerateContentPayload>({
    topic: "",
    style: "professional",
  });
  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);

  // Check authentication status
  React.useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

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

  const handleStyleChange = (value: string) => {
    setFormData({
      ...formData,
      style: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);

    try {
      const post = await contentAPI.generateContent(formData);
      setGeneratedPost(post);
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePost = async () => {
    if (!generatedPost) return;

    setIsSaving(true);

    try {
      const savedPost = await contentAPI.savePost({
        title: generatedPost.title,
        content: generatedPost.content,
        topic: generatedPost.topic,
        style: generatedPost.style,
      });

      toast.success("Content saved successfully!");
      navigate(`/edit/${savedPost.id}`);
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSharePost = async () => {
    if (!generatedPost) return;

    setIsSaving(true);

    try {
      const savedPost = await contentAPI.savePost({
        title: generatedPost.title,
        content: generatedPost.content,
        topic: generatedPost.topic,
        style: generatedPost.style,
        isPublished: true,
      });

      const url = `${window.location.origin}/post/${savedPost.id}`;
      await navigator.clipboard.writeText(url);

      toast.success("Link copied to clipboard!");
      navigate(`/post/${savedPost.id}`);
    } catch (error) {
      console.error("Error sharing content:", error);
      toast.error("Failed to share content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header isAuthenticated={true} onLogout={handleLogout} />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold font-display mb-2">
            Generate new content
          </h1>
          <p className="text-muted-foreground mb-8">
            Describe what you want to write about, and our AI will generate a high-quality post for you.
          </p>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or title</Label>
                  <Input
                    id="topic"
                    placeholder="E.g., The future of AI in healthcare"
                    value={formData.topic}
                    onChange={handleInputChange}
                    disabled={isGenerating}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Writing style</Label>
                  <Select
                    value={formData.style}
                    onValueChange={handleStyleChange}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="style" className="w-full">
                      <SelectValue placeholder="Select a writing style" />
                    </SelectTrigger>
                    <SelectContent>
                      {styleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <CustomButton
                    type="submit"
                    isLoading={isGenerating}
                    loadingText="Generating..."
                    className="w-full"
                  >
                    Generate content
                  </CustomButton>
                </div>
              </form>
            </CardContent>
          </Card>

          {isGenerating && (
            <div className="glassmorphism rounded-lg p-8 text-center animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Generating content...
              </h3>
              <p className="text-muted-foreground">
                Our AI is crafting a high-quality post based on your input.
                This might take a few moments.
              </p>
            </div>
          )}

          {generatedPost && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h2 className="text-2xl font-bold">Generated content</h2>
                <div className="flex gap-3">
                  <CustomButton
                    variant="outline"
                    onClick={handleSavePost}
                    isLoading={isSaving}
                    loadingText="Saving..."
                  >
                    <Save size={16} className="mr-2" />
                    Save as draft
                  </CustomButton>
                  <CustomButton
                    onClick={handleSharePost}
                    isLoading={isSaving}
                    loadingText="Sharing..."
                  >
                    <Share size={16} className="mr-2" />
                    Share
                  </CustomButton>
                </div>
              </div>

              <Separator />

              <div className="p-6 glassmorphism rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 break-words">
                  {generatedPost.title}
                </h1>
                <div className="max-h-[500px] overflow-auto pr-2">
                  <article className="prose prose-stone dark:prose-invert max-w-none break-words">
                    <ReactMarkdown className="text-balance whitespace-pre-wrap break-words">
                      {generatedPost.content}
                    </ReactMarkdown>
                  </article>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;
