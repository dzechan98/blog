import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, User, Settings, BookOpen, Home, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAdminPage = location.pathname.startsWith("/admin");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (isAdminPage) {
    return <>{children}</>;
  }

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
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full p-0"
                      >
                        {userProfile?.avatar ? (
                          <img
                            src={userProfile.avatar || "/placeholder.svg"}
                            alt={userProfile.displayName || "Avatar"}
                            className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {userProfile?.displayName || currentUser.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {currentUser.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/edit-profile" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Chỉnh sửa hồ sơ</span>
                        </Link>
                      </DropdownMenuItem>
                      {userProfile?.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Quản trị</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
