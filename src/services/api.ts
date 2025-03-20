
import { delay, generateId, getStoredPosts, getUserFromStorage, getUserRateLimit, savePostsToStorage, updateUserRateLimit } from '@/lib/utils';
import { AdminStats, AuthPayload, AuthResponse, GenerateContentPayload, Post, PostFormData, RateLimitInfo, SavePostPayload, User, UserCredentials, UserProfile } from '@/types';
import { OpenAIConfig, isOpenAIConfigured } from '@/config/openai';

// Utility function to handle API errors consistently
const apiErrorHandler = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API endpoints for authentication
export const authAPI = {
  login: async (payload: AuthPayload): Promise<AuthResponse> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(1500);
      
      // In a real app, this would verify credentials with a backend
      const user: User = {
        id: generateId(),
        email: payload.email,
        createdAt: new Date().toISOString()
      };
      
      return {
        user,
        token: `mock-jwt-token-${Date.now()}`,
      };
    });
  },
  
  signup: async (payload: AuthPayload): Promise<AuthResponse> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(2000);
      
      // In a real app, this would create a new user in the database
      const user: User = {
        id: generateId(),
        email: payload.email,
        createdAt: new Date().toISOString()
      };
      
      return {
        user,
        token: `mock-jwt-token-${Date.now()}`,
      };
    });
  },
  
  logout: async (): Promise<void> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(500);
      
      // In a real app, this would invalidate the JWT token
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
    });
  },
  
  getCurrentUser: async (): Promise<User> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(500);
      
      const user = getUserFromStorage();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      return user;
    });
  }
};

// API endpoints for content management
export const contentAPI = {
  generateContent: async (payload: GenerateContentPayload): Promise<Post> => {
    return apiErrorHandler(async () => {
      // Check user authentication
      const user = getUserFromStorage();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check rate limit
      const rateLimit = updateUserRateLimit(user.id || "unknown");
      if (rateLimit.remaining <= 0) {
        const resetTime = new Date(rateLimit.resetTime);
        throw new Error(`Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      }
      
      // If OpenAI is configured, use the API
      if (isOpenAIConfigured()) {
        try {
          console.log("Generating content with OpenAI API");
          const generatedContent = await generateWithOpenAI(payload);
          return generatedContent;
        } catch (error) {
          console.error("OpenAI API error:", error);
          console.log("Falling back to mock content generation");
          // Fall back to mock generation if API fails
          return generateMockContent(payload);
        }
      } else {
        console.log("OpenAI not configured, using mock content");
        // Use mock generation if OpenAI is not configured
        return generateMockContent(payload);
      }
    });
  },
  
  savePost: async (payload: SavePostPayload): Promise<Post> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(1000);
      
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check rate limit
      const rateLimit = updateUserRateLimit(user.id || "unknown");
      if (rateLimit.remaining <= 0) {
        const resetTime = new Date(rateLimit.resetTime);
        throw new Error(`Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      }
      
      const posts = getStoredPosts();
      const now = new Date().toISOString();
      
      // Check if this is an update or a new post
      if (payload.id) {
        // Update existing post
        const updatedPosts = posts.map(post => {
          if (post.id === payload.id) {
            return {
              ...post,
              title: payload.title,
              content: payload.content,
              topic: payload.topic,
              style: payload.style,
              isPublished: payload.isPublished ?? post.isPublished,
              publishDate: payload.publishDate,
              updatedAt: now,
            };
          }
          return post;
        });
        
        savePostsToStorage(updatedPosts);
        return updatedPosts.find(post => post.id === payload.id) as Post;
      } else {
        // Create new post
        const newPost: Post = {
          id: generateId(),
          title: payload.title,
          content: payload.content,
          topic: payload.topic,
          style: payload.style,
          isPublished: payload.isPublished ?? false,
          publishDate: payload.publishDate,
          createdAt: now,
          updatedAt: now,
          userId: user.id || "unknown",
        };
        
        posts.push(newPost);
        savePostsToStorage(posts);
        return newPost;
      }
    });
  },
  
  getUserPosts: async (): Promise<Post[]> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(1000);
      
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const posts = getStoredPosts();
      
      // Filter posts by user ID
      return posts.filter(post => post.userId === user.id);
    });
  },
  
  getPostById: async (id: string): Promise<Post> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(500);
      
      const posts = getStoredPosts();
      const post = posts.find(post => post.id === id);
      
      if (!post) {
        throw new Error("Post not found");
      }
      
      return post;
    });
  },
  
  deletePost: async (id: string): Promise<void> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(800);
      
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check rate limit
      const rateLimit = updateUserRateLimit(user.id || "unknown");
      if (rateLimit.remaining <= 0) {
        const resetTime = new Date(rateLimit.resetTime);
        throw new Error(`Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      }
      
      const posts = getStoredPosts();
      const filteredPosts = posts.filter(post => post.id !== id);
      
      if (posts.length === filteredPosts.length) {
        throw new Error("Post not found");
      }
      
      savePostsToStorage(filteredPosts);
    });
  },
  
  publishPost: async (id: string, isPublished: boolean): Promise<Post> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(800);
      
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check rate limit
      const rateLimit = updateUserRateLimit(user.id || "unknown");
      if (rateLimit.remaining <= 0) {
        const resetTime = new Date(rateLimit.resetTime);
        throw new Error(`Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      }
      
      const posts = getStoredPosts();
      let updatedPost: Post | undefined;
      
      const updatedPosts = posts.map(post => {
        if (post.id === id) {
          updatedPost = {
            ...post,
            isPublished,
            updatedAt: new Date().toISOString(),
          };
          return updatedPost;
        }
        return post;
      });
      
      if (!updatedPost) {
        throw new Error("Post not found");
      }
      
      savePostsToStorage(updatedPosts);
      return updatedPost;
    });
  },
  
  // Function to get rate limit information for the current user
  getUserRateLimit: async (): Promise<RateLimitInfo> => {
    return apiErrorHandler(async () => {
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      return getUserRateLimit(user.id || "unknown");
    });
  }
};

// Function to generate content with OpenAI
const generateWithOpenAI = async (payload: GenerateContentPayload): Promise<Post> => {
  // Simulate API delay
  await delay(1500);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OpenAIConfig.apiKey}`
      },
      body: JSON.stringify({
        model: OpenAIConfig.model,
        messages: [
          {
            role: "system",
            content: "You are a professional content writer. Create a blog post that is well-structured with headings, subheadings, and paragraphs. Include an introduction and conclusion."
          },
          {
            role: "user",
            content: `Write a ${payload.style} blog post about ${payload.topic}. Use markdown formatting with # for title, ## for headings, and other markdown elements as needed.`
          }
        ],
        max_tokens: OpenAIConfig.maxTokens,
        temperature: OpenAIConfig.temperature
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate content with OpenAI');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract title and content
    const lines = content.split('\n');
    let title = payload.topic;
    let blogContent = content;
    
    // Try to extract title from the first line if it starts with #
    if (lines[0].startsWith('# ')) {
      title = lines[0].substring(2);
      blogContent = lines.slice(1).join('\n');
    }
    
    return {
      id: `draft-${Date.now()}`,
      title: title,
      content: blogContent,
      topic: payload.topic,
      style: payload.style,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: getUserFromStorage()?.id || 'unknown',
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

// Function to generate mock content for fallback
const generateMockContent = (payload: GenerateContentPayload): Post => {
  const title = `${payload.topic} in ${payload.style} Style`;
  
  // Create content based on topic and style
  let content = "";
  
  // Introduction
  content += `## Introduction\n\n`;
  content += `This is an introduction to ${payload.topic}. It sets the stage for the rest of the article and captures the reader's attention.\n\n`;
  
  // Main content sections
  content += `## Understanding ${payload.topic}\n\n`;
  content += `Here we explore the key aspects of ${payload.topic} and why it matters in today's world.\n\n`;
  
  content += `## Key Benefits\n\n`;
  content += `- Benefit 1: Improved efficiency and productivity\n`;
  content += `- Benefit 2: Better outcomes and results\n`;
  content += `- Benefit 3: Enhanced user experience\n\n`;
  
  // Add more content based on style
  if (payload.style === "technical") {
    content += `## Technical Implementation\n\n`;
    content += `When implementing solutions related to ${payload.topic}, consider these technical aspects:\n\n`;
    content += `1. Architecture design\n`;
    content += `2. Performance optimization\n`;
    content += `3. Security considerations\n\n`;
    content += `\`\`\`\nExample code or configuration\n\`\`\`\n\n`;
  } else if (payload.style === "casual") {
    content += `## My Personal Experience\n\n`;
    content += `Let me share a story about how ${payload.topic} changed my perspective. It was a sunny afternoon when...\n\n`;
  } else if (payload.style === "persuasive") {
    content += `## Why You Should Act Now\n\n`;
    content += `The time to embrace ${payload.topic} is now. Those who wait will miss out on these critical advantages that early adopters are already enjoying.\n\n`;
  }
  
  // Conclusion
  content += `## Conclusion\n\n`;
  content += `In summary, ${payload.topic} represents a significant opportunity that should not be overlooked. The insights shared in this article provide a foundation for further exploration and application.\n\n`;
  
  return {
    id: `draft-${Date.now()}`,
    title,
    content,
    topic: payload.topic,
    style: payload.style,
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: getUserFromStorage()?.id || 'unknown',
  };
};

// Admin API
export const adminAPI = {
  getAdminStats: async (): Promise<AdminStats> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(1000);
      
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      if (user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      const posts = getStoredPosts();
      
      // Get all users (in a real app, this would be from a users table)
      // For our mock, we'll extract unique user IDs from posts
      const uniqueUserIds = new Set(posts.map(post => post.userId));
      
      // Calculate statistics
      const stats: AdminStats = {
        totalUsers: uniqueUserIds.size || 0,
        totalPosts: posts.length,
        publishedPosts: posts.filter(post => post.isPublished).length,
        scheduledPosts: posts.filter(post => post.publishDate && new Date(post.publishDate) > new Date()).length
      };
      
      return stats;
    });
  },
  
  getAllUsers: async (): Promise<User[]> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(1000);
      
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      if (user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      // In a real app, this would fetch all users from a database
      // For our mock, we'll create a small set of sample users
      const currentUser = getUserFromStorage();
      
      // Make sure the current user is an admin in local storage
      if (currentUser && !currentUser.role) {
        currentUser.role = "admin";
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      
      const mockUsers: User[] = [
        {
          id: currentUser?.id || "admin-1",
          email: currentUser?.email || "admin@example.com",
          name: "Admin User",
          role: "admin",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "user-1",
          email: "user1@example.com",
          name: "Regular User 1",
          role: "user",
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "user-2",
          email: "user2@example.com",
          name: "Regular User 2",
          role: "user",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "user-3",
          email: "user3@example.com",
          name: "Regular User 3",
          role: "user",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      return mockUsers;
    });
  },
  
  getAllPosts: async (): Promise<Post[]> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(1500);
      
      const user = getUserFromStorage();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      if (user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      // Get all posts regardless of user
      return getStoredPosts();
    });
  },
  
  updateUserRole: async (userId: string, role: "user" | "admin"): Promise<User> => {
    return apiErrorHandler(async () => {
      // Simulate API call
      await delay(1000);
      
      const currentUser = getUserFromStorage();
      
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      if (currentUser.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      
      // In a real app, this would update the user role in the database
      // For our mock, we'll just return a successful response
      
      // If updating the current user, update localStorage
      if (userId === currentUser.id) {
        const updatedUser = {
          ...currentUser,
          role
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      // For other users, just return a mock response
      return {
        id: userId,
        email: `user-${userId}@example.com`,
        role,
        updatedAt: new Date().toISOString()
      };
    });
  }
};

// Create a simple "database logger" for tracking database operations
export const dbLogger = {
  logOperation: (operation: string, details: any): void => {
    const logs = JSON.parse(localStorage.getItem("db_logs") || "[]");
    logs.push({
      timestamp: new Date().toISOString(),
      operation,
      details,
      user: getUserFromStorage()?.id || "anonymous"
    });
    
    // Keep only the last 100 logs to prevent localStorage from getting too large
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem("db_logs", JSON.stringify(logs));
  },
  
  getLogs: (): any[] => {
    return JSON.parse(localStorage.getItem("db_logs") || "[]");
  },
  
  clearLogs: (): void => {
    localStorage.setItem("db_logs", "[]");
  }
};
