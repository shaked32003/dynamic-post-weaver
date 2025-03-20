import { delay, generateId, getUserFromStorage } from "@/lib/utils";
import { 
  Post, 
  GenerateContentPayload, 
  SavePostPayload,
  AuthPayload,
  User,
  AuthResponse,
  RateLimitInfo,
  AdminStats
} from "@/types";

// This is a mock API service for frontend development
// In a real application, these functions would make actual API calls

// Simulate a database with localStorage
const POSTS_STORAGE_KEY = "content_forge_posts";
const RATE_LIMIT_STORAGE_KEY = "content_forge_rate_limits";
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_HOUR = 20;

// Helper function to get posts from localStorage
const getStoredPosts = (): Post[] => {
  const postsString = localStorage.getItem(POSTS_STORAGE_KEY);
  return postsString ? JSON.parse(postsString) : [];
};

// Helper function to save posts to localStorage
const savePostsToStorage = (posts: Post[]): void => {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

// Rate limiting functions
const getUserRateLimit = (userId: string): RateLimitInfo => {
  const rateLimitsString = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  const rateLimits = rateLimitsString ? JSON.parse(rateLimitsString) : {};
  
  if (!rateLimits[userId]) {
    const newLimit: RateLimitInfo = {
      limit: MAX_REQUESTS_PER_HOUR,
      current: 0,
      remaining: MAX_REQUESTS_PER_HOUR,
      resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW)
    };
    rateLimits[userId] = newLimit;
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(rateLimits));
    return newLimit;
  }
  
  // Check if we need to reset the rate limit
  const limitData = rateLimits[userId];
  const resetTime = new Date(limitData.resetTime);
  
  if (Date.now() > resetTime.getTime()) {
    // Reset the rate limit
    limitData.current = 0;
    limitData.remaining = MAX_REQUESTS_PER_HOUR;
    limitData.resetTime = new Date(Date.now() + RATE_LIMIT_WINDOW);
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(rateLimits));
  }
  
  return limitData;
};

const updateUserRateLimit = (userId: string): RateLimitInfo => {
  const rateLimitsString = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  const rateLimits = rateLimitsString ? JSON.parse(rateLimitsString) : {};
  
  if (!rateLimits[userId]) {
    return getUserRateLimit(userId);
  }
  
  const limitData = rateLimits[userId];
  const resetTime = new Date(limitData.resetTime);
  
  if (Date.now() > resetTime.getTime()) {
    // Reset the rate limit
    limitData.current = 1;
    limitData.remaining = MAX_REQUESTS_PER_HOUR - 1;
    limitData.resetTime = new Date(Date.now() + RATE_LIMIT_WINDOW);
  } else {
    // Increment the request count
    limitData.current += 1;
    limitData.remaining = Math.max(0, limitData.limit - limitData.current);
  }
  
  rateLimits[userId] = limitData;
  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(rateLimits));
  return limitData;
};

// Error handling wrapper
const apiErrorHandler = <T>(apiCall: () => Promise<T>): Promise<T> => {
  return apiCall().catch(error => {
    console.error("API Error:", error);
    
    // Log the error (in a real app, this might send to a logging service)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    // Store error logs (in a real app, this would go to a proper logging system)
    const errorLogs = JSON.parse(localStorage.getItem("error_logs") || "[]");
    errorLogs.push(errorLog);
    localStorage.setItem("error_logs", JSON.stringify(errorLogs));
    
    throw error; // Re-throw to let the UI handle it
  });
};

// Authentication
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

// Content generation and management
export const contentAPI = {
  generateContent: async (payload: GenerateContentPayload): Promise<Post> => {
    return apiErrorHandler(async () => {
      // Simulate API call with longer delay for content generation
      await delay(3000);
      
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
      
      // Create mock generated content
      const title = `${payload.topic} in ${payload.style} Style`;
      
      // Create content based on topic and style
      let content = "";
      
      if (payload.topic.toLowerCase().includes("technology")) {
        content = `
          # The Evolution of Technology

          In today's rapidly advancing technological landscape, innovation is the key driver of progress. From artificial intelligence to quantum computing, the boundaries of what's possible are constantly expanding.

          ## Current Trends

          - **Artificial Intelligence**: Machine learning algorithms are becoming more sophisticated.
          - **Blockchain**: Decentralized applications are revolutionizing finance.
          - **Internet of Things**: Connected devices are creating smarter homes and cities.

          ## Future Implications

          As these technologies evolve, we can expect significant changes in how we work, communicate, and live. The integration of AI into everyday tools will automate routine tasks, while blockchain may transform how we verify transactions and maintain records.

          ## Conclusion

          Staying informed about technological advancements is essential for businesses and individuals alike. The ability to adapt to these changes will determine success in the digital age.
        `;
      } else if (payload.topic.toLowerCase().includes("health")) {
        content = `
          # Holistic Approaches to Health and Wellness

          Maintaining optimal health involves more than just addressing physical symptoms. A holistic approach considers the interconnectedness of mind, body, and spirit.

          ## Key Components

          - **Nutrition**: A balanced diet provides essential nutrients for bodily functions.
          - **Physical Activity**: Regular exercise strengthens the body and improves mood.
          - **Mental Wellbeing**: Practices like meditation reduce stress and promote clarity.

          ## Integrative Practices

          Many people are turning to integrative health practices that combine conventional medicine with complementary approaches. These might include acupuncture, yoga, or herbal supplements.

          ## Preventative Care

          Taking proactive steps to prevent illness is often more effective than treating conditions after they develop. Regular check-ups, screenings, and lifestyle modifications play crucial roles in preventative care.
        `;
      } else {
        content = `
          # Exploring ${payload.topic}

          ${payload.topic} represents a fascinating area of study with numerous implications for our understanding of the world. This field continues to evolve, offering new insights and applications.

          ## Historical Context

          The development of ${payload.topic} can be traced through various historical periods, each contributing unique perspectives and methodologies. Early pioneers laid the groundwork for modern approaches.

          ## Current Applications

          Today, ${payload.topic} influences multiple sectors:

          1. Research and academia
          2. Industrial applications
          3. Consumer products and services
          4. Educational frameworks

          ## Future Directions

          As we look ahead, several promising avenues for advancement in ${payload.topic} emerge. Continued research and innovation will likely yield breakthroughs that reshape our understanding and implementation.
        `;
      }
      
      // Adjust style based on input
      if (payload.style.toLowerCase().includes("professional")) {
        content = content.replace(/fascinating/g, "significant").replace(/numerous/g, "substantial");
      } else if (payload.style.toLowerCase().includes("casual")) {
        content = content.replace(/represents a/g, "is a").replace(/continues to evolve/g, "keeps changing");
      }
      
      return {
        id: generateId(),
        title,
        content,
        topic: payload.topic,
        style: payload.style,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id || "unknown",
      };
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
