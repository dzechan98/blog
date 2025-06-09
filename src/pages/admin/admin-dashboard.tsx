import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Blog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Calendar,
  LoaderCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalCategories: 0,
    publishedBlogs: 0,
    todayBlogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard - BlogApp";
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        const blogsSnapshot = await getDocs(collection(db, "blogs"));
        const blogs = blogsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Blog[];
        const totalBlogs = blogs.length;
        const publishedBlogs = blogs.filter((blog) => blog.published).length;

        const today = new Date();
        const todayBlogs = blogs.filter((blog) => {
          const blogDate = blog.createdAt;
          return (
            blogDate &&
            blogDate.getDate() === today.getDate() &&
            blogDate.getMonth() === today.getMonth() &&
            blogDate.getFullYear() === today.getFullYear()
          );
        }).length;

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const totalCategories = categoriesSnapshot.size;

        setStats({
          totalUsers,
          totalBlogs,
          totalCategories,
          publishedBlogs,
          todayBlogs,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen justify-center items-center">
          <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tổng quan hệ thống
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và theo dõi hoạt động của BlogApp
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng người dùng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Đã đăng ký</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng bài viết
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlogs}</div>
              <p className="text-xs text-muted-foreground">Tất cả bài viết</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedBlogs}</div>
              <p className="text-xs text-muted-foreground">Công khai</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayBlogs}</div>
              <p className="text-xs text-muted-foreground">Bài viết mới</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">Phân loại</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Quản lý bài viết
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Xem, duyệt và quản lý tất cả bài viết của người dùng. Hiện có{" "}
                {stats.totalBlogs} bài viết.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin/blogs">
                  Quản lý bài viết
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Quản lý người dùng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Xem danh sách và quản lý người dùng hệ thống. Hiện có{" "}
                {stats.totalUsers} người dùng.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin/users">
                  Quản lý người dùng
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                Quản lý danh mục
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Tạo, chỉnh sửa và xóa các danh mục bài viết. Hiện có{" "}
                {stats.totalCategories} danh mục.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin/categories">
                  Quản lý danh mục
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
