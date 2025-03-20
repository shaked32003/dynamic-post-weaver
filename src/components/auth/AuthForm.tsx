
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authAPI } from "@/services/api";
import { AuthPayload } from "@/types";

interface AuthFormProps {
  type: "login" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (type === "signup" && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const authPayload: AuthPayload = {
        email: formData.email,
        password: formData.password
      };
      
      // Call the appropriate auth API method
      const response = type === "login" 
        ? await authAPI.login(authPayload)
        : await authAPI.signup(authPayload);
      
      // Store user data and token
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      
      toast.success(`${type === "login" ? "Logged in" : "Account created"} successfully!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 glassmorphism rounded-2xl shadow-xl">
      <div className="space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {type === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {type === "login"
              ? "Enter your credentials to access your account"
              : "Enter your details to create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              autoComplete={type === "login" ? "current-password" : "new-password"}
            />
          </div>

          {type === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <CustomButton
            type="submit"
            isLoading={isLoading}
            loadingText={type === "login" ? "Logging in..." : "Creating account..."}
            className="w-full"
          >
            {type === "login" ? "Login" : "Create account"}
          </CustomButton>
        </form>

        <div className="text-center text-sm">
          {type === "login" ? (
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <a href="/login" className="text-primary font-medium hover:underline">
                Login
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
