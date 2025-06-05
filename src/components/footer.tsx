import { Link } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">BlogApp</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nền tảng chia sẻ kiến thức và kết nối cộng đồng yêu thích viết
              lách. Nơi mọi ý tưởng đều có giá trị và mọi câu chuyện đều đáng
              được kể.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Danh mục phổ biến
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/category/technology"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Công nghệ
                </Link>
              </li>
              <li>
                <Link
                  to="/category/lifestyle"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Lối sống
                </Link>
              </li>
              <li>
                <Link
                  to="/category/business"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Kinh doanh
                </Link>
              </li>
              <li>
                <Link
                  to="/category/education"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Giáo dục
                </Link>
              </li>
              <li>
                <Link
                  to="/category/travel"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Du lịch
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@blogapp.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Đăng ký nhận tin
              </h4>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="text-sm"
                />
                <Button size="sm">Đăng ký</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Nhận thông báo về các bài viết mới nhất
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} BlogApp. Tất cả quyền được bảo lưu.
          </div>

          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Được tạo với</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>tại Việt Nam</span>
          </div>

          <div className="flex space-x-6 text-sm">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Bảo mật
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Điều khoản
            </Link>
            <Link
              to="/sitemap"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
