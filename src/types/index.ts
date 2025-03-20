
export interface User {
  id?: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  topic: string;
  style: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  publishDate?: string; // For scheduled publishing
}

export interface GenerateContentPayload {
  topic: string;
  style: string;
}

export interface SavePostPayload {
  id?: string;
  title: string;
  content: string;
  topic: string;
  style: string;
  isPublished?: boolean;
  publishDate?: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// For rate limiting
export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}
