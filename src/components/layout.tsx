import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, User, Settings, BookOpen, Home } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav
        className={cn(
          "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm border-b border-border transition-all duration-200",
          isHomePage ? "fixed top-0 left-0 right-0 z-50" : "relative"
        )}
      >
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
                <div className="hidden md:flex space-x-4">
                  <Link
                    to="/"
                    className={cn(
                      "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === "/"
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Trang chủ</span>
                  </Link>

                  {userProfile?.role === "admin" ? (
                    <Link
                      to="/admin"
                      className={cn(
                        "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        location.pathname.startsWith("/admin")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Quản trị</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className={cn(
                        "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        location.pathname.startsWith("/dashboard")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
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
                  <span className="hidden sm:block text-sm text-muted-foreground">
                    Xin chào, {userProfile?.displayName || currentUser.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Đăng xuất</span>
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

      <main
        className={cn(
          "flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full",
          isHomePage && "pt-22"
        )}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};
