import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Home, History, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NutriCalc
              </h1>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                asChild
                variant={isActive("/dashboard") ? "default" : "ghost"}
                size="sm"
              >
                <Link to="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/history") ? "default" : "ghost"}
                size="sm"
              >
                <Link to="/history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
