
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/ui/custom-button";
import { Menu, X, User } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  hidden?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    hidden: true, // Only shown when authenticated
  },
  {
    title: "Generate",
    href: "/generate",
    hidden: true, // Only shown when authenticated
  },
];

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isAuthenticated = false,
  onLogout = () => console.log("Logout clicked") 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Filter nav items based on authentication status
  const filteredNavItems = navItems.filter(
    (item) => !item.hidden || (item.hidden && isAuthenticated)
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "glassmorphism py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-display font-bold flex items-center"
        >
          <span>ContentForge</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "text-primary"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="flex items-center space-x-2 ml-2">
              <Link to="/dashboard">
                <CustomButton
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <User size={18} />
                </CustomButton>
              </Link>
              <CustomButton
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </CustomButton>
            </div>
          ) : (
            <div className="flex items-center space-x-2 ml-2">
              <Link to="/login">
                <CustomButton variant="outline" size="sm">
                  Login
                </CustomButton>
              </Link>
              <Link to="/signup">
                <CustomButton variant="default" size="sm">
                  Sign up
                </CustomButton>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 glassmorphism p-4 md:hidden border-b animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    location.pathname === item.href
                      ? "bg-secondary text-primary font-medium"
                      : "hover:bg-secondary/80"
                  )}
                >
                  {item.title}
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                    className="w-full justify-start"
                  >
                    Logout
                  </CustomButton>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Link
                    to="/login"
                    className="w-full"
                  >
                    <CustomButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Login
                    </CustomButton>
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full"
                  >
                    <CustomButton
                      variant="default"
                      size="sm"
                      className="w-full"
                    >
                      Sign up
                    </CustomButton>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
