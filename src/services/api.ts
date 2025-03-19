
import { delay, generateId, getUserFromStorage } from "@/lib/utils";
import { 
  Post, 
  GenerateContentPayload, 
  SavePostPayload,
  AuthPayload,
  User,
  AuthResponse 
} from "@/types";

// This is a mock API service for frontend development
// In a real application, these functions would make actual API calls

// Simulate a database with localStorage
const POSTS_STORAGE_KEY = "content_forge_posts";

// Helper function to get posts from localStorage
const getStoredPosts = (): Post[] => {
  const postsString = localStorage.getItem(POSTS_STORAGE_KEY);
  return postsString ? JSON.parse(postsString) : [];
};

// Helper function to save posts to localStorage
const savePostsToStorage = (posts: Post[]): void => {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

// Authentication
export const authAPI = {
  login: async (payload: AuthPayload): Promise<AuthResponse> => {
    // Simulate API call
    await delay(1500);
    
    // In a real app, this would verify credentials with a backend
    const user: User = {
      id: generateId(),
      email: payload.email,
    };
    
    return {
      user,
      token: `mock-jwt-token-${Date.now()}`,
    };
  },
  
  signup: async (payload: AuthPayload): Promise<AuthResponse> => {
    // Simulate API call
    await delay(2000);
    
    // In a real app, this would create a new user in the database
    const user: User = {
      id: generateId(),
      email: payload.email,
    };
    
    return {
      user,
      token: `mock-jwt-token-${Date.now()}`,
    };
  },
  
  logout: async (): Promise<void> => {
    // Simulate API call
    await delay(500);
    
    // In a real app, this would invalidate the JWT token
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  }
};

// Content generation and management
export const contentAPI = {
  generateContent: async (payload: GenerateContentPayload): Promise<Post> => {
    // Simulate API call with longer delay for content generation
    await delay(3000);
    
    // In a real app, this would call OpenAI or another LLM API
    const user = getUserFromStorage();
    
    if (!user) {
      throw new Error("User not authenticated");
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
  },
  
  savePost: async (payload: SavePostPayload): Promise<Post> => {
    // Simulate API call
    await delay(1000);
    
    const user = getUserFromStorage();
    
    if (!user) {
      throw new Error("User not authenticated");
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
        createdAt: now,
        updatedAt: now,
        userId: user.id || "unknown",
      };
      
      posts.push(newPost);
      savePostsToStorage(posts);
      return newPost;
    }
  },
  
  getUserPosts: async (): Promise<Post[]> => {
    // Simulate API call
    await delay(1000);
    
    const user = getUserFromStorage();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const posts = getStoredPosts();
    
    // Filter posts by user ID
    return posts.filter(post => post.userId === user.id);
  },
  
  getPostById: async (id: string): Promise<Post> => {
    // Simulate API call
    await delay(500);
    
    const posts = getStoredPosts();
    const post = posts.find(post => post.id === id);
    
    if (!post) {
      throw new Error("Post not found");
    }
    
    return post;
  },
  
  deletePost: async (id: string): Promise<void> => {
    // Simulate API call
    await delay(800);
    
    const user = getUserFromStorage();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const posts = getStoredPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    
    if (posts.length === filteredPosts.length) {
      throw new Error("Post not found");
    }
    
    savePostsToStorage(filteredPosts);
  },
  
  publishPost: async (id: string, isPublished: boolean): Promise<Post> => {
    // Simulate API call
    await delay(800);
    
    const user = getUserFromStorage();
    
    if (!user) {
      throw new Error("User not authenticated");
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
  }
};
