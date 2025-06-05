"use client";

import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, User, Settings, BookOpen, Home } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">
                  BlogApp
                </span>
              </Link>

              {currentUser && (
                <div className="flex space-x-4">
                  <Link
                    to="/"
                    className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
                  >
                    <Home className="h-4 w-4" />
                    <span>Trang chủ</span>
                  </Link>

                  {userProfile?.role === "admin" ? (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Quản trị</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {currentUser ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Xin chào, {userProfile?.displayName || currentUser.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <div className="space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Đăng ký</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
