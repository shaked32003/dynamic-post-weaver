
import React from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import Header from "@/components/layout/Header";
import { isAuthenticated } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuth) {
      navigate("/dashboard");
    }
  }, [isAuth, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header isAuthenticated={false} />
      
      <div className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center justify-center">
        <AuthForm type="login" />
      </div>
    </div>
  );
};

export default Login;
