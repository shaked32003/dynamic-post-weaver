
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism p-12 rounded-2xl max-w-md w-full text-center"
      >
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-8xl font-bold font-display mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        <CustomButton 
          onClick={() => navigate("/")}
          size="lg"
          className="group"
        >
          <Home className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
          Return home
        </CustomButton>
      </motion.div>
    </div>
  );
};

export default NotFound;
