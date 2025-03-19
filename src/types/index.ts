
export interface User {
  id?: string;
  email: string;
  name?: string;
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
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
