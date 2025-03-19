
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to a readable string
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Truncate text with ellipsis
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// Get user from localStorage
export function getUserFromStorage(): User | null {
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return localStorage.getItem("isAuthenticated") === "true";
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Create a blur hash placeholder string
export function createPlaceholderImage(width = 1200, height = 630): string {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0" /%3E%3C/svg%3E`;
}

// Delay promise resolution (for simulating API calls)
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
