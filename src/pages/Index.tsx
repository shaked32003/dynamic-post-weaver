
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import { CustomButton } from "@/components/ui/custom-button";
import { isAuthenticated } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, delay: 0.2 }
    }
  };

  const featuresList = [
    {
      title: "AI-Powered Content",
      description: "Generate high-quality blog posts with just a few clicks using advanced AI.",
    },
    {
      title: "Edit & Save Drafts",
      description: "Refine your content and save drafts for later in your personal dashboard.",
    },
    {
      title: "One-Click Publishing",
      description: "Share your content instantly with a public link for anyone to view.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header isAuthenticated={isAuth} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 container mx-auto">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex-1 space-y-6">
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mb-4">
                Introducing ContentForge
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight"
              variants={itemVariants}
            >
              Create stunning content <br className="hidden md:inline" />
              <span className="text-primary">powered by AI</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground max-w-lg"
              variants={itemVariants}
            >
              Generate, edit, and publish professional blog posts in minutes. 
              Just describe your topic and style, and let our AI do the rest.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={itemVariants}
            >
              <CustomButton 
                size="lg" 
                onClick={() => navigate(isAuth ? "/generate" : "/signup")} 
                className="group"
              >
                {isAuth ? "Create content" : "Get started"} 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </CustomButton>
              
              <CustomButton 
                variant="outline" 
                size="lg" 
                onClick={() => navigate(isAuth ? "/dashboard" : "/login")}
              >
                {isAuth ? "View dashboard" : "Log in"}
              </CustomButton>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex-1 rounded-2xl overflow-hidden shadow-2xl border"
            variants={imageVariants}
          >
            <img 
              src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="AI Content Generator" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">How it works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ContentForge makes content creation simple, fast, and powerful.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <motion.div
              key={index}
              className="glassmorphism p-8 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-5">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Ready to transform your content creation?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of writers, marketers, and businesses creating 
            professional content with AI.
          </p>
          <CustomButton 
            variant="secondary" 
            size="lg" 
            onClick={() => navigate(isAuth ? "/generate" : "/signup")}
          >
            {isAuth ? "Generate content now" : "Start for free"} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </CustomButton>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ContentForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
