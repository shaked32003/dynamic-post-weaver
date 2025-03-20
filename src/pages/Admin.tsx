
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { adminAPI, contentAPI } from "@/services/api";
import { User, Post } from "@/types";
import Header from "@/components/layout/Header";
import { isAuthenticated } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";

const AdminPanel = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  // Get admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => adminAPI.getAdminStats(),
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : "Failed to load admin stats";
      toast.error(errorMsg);
      if (errorMsg.includes("Unauthorized")) {
        navigate("/dashboard");
      }
    },
  });

  // Get all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => adminAPI.getAllUsers(),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to load users");
    },
  });

  // Get all posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["adminPosts"],
    queryFn: () => adminAPI.getAllPosts(),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to load posts");
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "user" | "admin" }) =>
      adminAPI.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setIsUserDialogOpen(false);
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update user role");
    },
  });

  // Publish/unpublish post mutation
  const publishPostMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      contentAPI.publishPost(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setIsPostDialogOpen(false);
      toast.success("Post status updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update post status");
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (id: string) => contentAPI.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setIsPostDialogOpen(false);
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete post");
    },
  });

  // Handle post row click
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsPostDialogOpen(true);
  };

  // Handle user row click
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP p");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
          
          {statsLoading ? (
            <div className="flex justify-center">
              <p>Loading admin data...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Published Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.publishedPosts || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Scheduled Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.scheduledPosts || 0}</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabs for Users and Posts */}
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full md:w-80 grid-cols-2">
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>
                
                {/* Users Tab */}
                <TabsContent value="users">
                  <Card>
                    <CardHeader>
                      <CardTitle>Users Management</CardTitle>
                      <CardDescription>
                        View and manage all users in the system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {usersLoading ? (
                        <div className="flex justify-center py-4">
                          <p>Loading users...</p>
                        </div>
                      ) : (
                        <Table>
                          <TableCaption>A list of all users in the system.</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Email</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Created At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users?.map((user) => (
                              <TableRow 
                                key={user.id} 
                                onClick={() => handleUserClick(user)}
                                className="cursor-pointer"
                              >
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.name || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                    {user.role || "user"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Posts Tab */}
                <TabsContent value="posts">
                  <Card>
                    <CardHeader>
                      <CardTitle>Posts Management</CardTitle>
                      <CardDescription>
                        View and manage all posts in the system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {postsLoading ? (
                        <div className="flex justify-center py-4">
                          <p>Loading posts...</p>
                        </div>
                      ) : (
                        <Table>
                          <TableCaption>A list of all posts in the system.</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Topic</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Last Updated</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {posts?.map((post) => (
                              <TableRow 
                                key={post.id} 
                                onClick={() => handlePostClick(post)}
                                className="cursor-pointer"
                              >
                                <TableCell className="font-medium">{post.title}</TableCell>
                                <TableCell>{post.topic}</TableCell>
                                <TableCell>
                                  {post.isPublished ? (
                                    post.publishDate && new Date(post.publishDate) > new Date() ? (
                                      <Badge variant="secondary">Scheduled</Badge>
                                    ) : (
                                      <Badge>Published</Badge>
                                    )
                                  ) : (
                                    <Badge variant="outline">Draft</Badge>
                                  )}
                                </TableCell>
                                <TableCell>{formatDate(post.createdAt)}</TableCell>
                                <TableCell>{formatDate(post.updatedAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </PageTransition>
      
      {/* Post Details Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              View and manage post details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                <p className="text-base">{selectedPost.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Topic & Style</h3>
                <p className="text-base">{selectedPost.topic} ({selectedPost.style})</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="flex items-center gap-2">
                  {selectedPost.isPublished ? (
                    selectedPost.publishDate && new Date(selectedPost.publishDate) > new Date() ? (
                      <Badge variant="secondary">Scheduled for {formatDate(selectedPost.publishDate)}</Badge>
                    ) : (
                      <Badge>Published</Badge>
                    )
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                <p className="text-base">User ID: {selectedPost.userId}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/edit/${selectedPost?.id}`)}
            >
              Edit Post
            </Button>
            
            <Button
              variant={selectedPost?.isPublished ? "outline" : "default"}
              onClick={() => publishPostMutation.mutate({ 
                id: selectedPost?.id || "", 
                isPublished: !selectedPost?.isPublished 
              })}
              disabled={publishPostMutation.isPending}
            >
              {selectedPost?.isPublished ? "Unpublish" : "Publish"}
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => deletePostMutation.mutate(selectedPost?.id || "")}
              disabled={deletePostMutation.isPending}
            >
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-base">{selectedUser.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-base">{selectedUser.name || "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedUser.role === "admin" ? "default" : "outline"}>
                    {selectedUser.role || "user"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Joined</h3>
                <p className="text-base">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {selectedUser?.role === "admin" ? (
              <CustomButton
                isLoading={updateUserRoleMutation.isPending}
                onClick={() => updateUserRoleMutation.mutate({ 
                  userId: selectedUser?.id || "", 
                  role: "user" 
                })}
              >
                Remove Admin Privileges
              </CustomButton>
            ) : (
              <CustomButton
                isLoading={updateUserRoleMutation.isPending}
                onClick={() => updateUserRoleMutation.mutate({ 
                  userId: selectedUser?.id || "", 
                  role: "admin" 
                })}
              >
                Make Admin
              </CustomButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
