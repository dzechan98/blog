import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Blog } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  TrendingUp,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const blogsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Blog[];
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Có lỗi xảy ra khi tải bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && blog.published) ||
      (statusFilter === "draft" && !blog.published);

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (blogId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      await deleteDoc(doc(db, "blogs", blogId));
      setBlogs(blogs.filter((blog) => blog.id !== blogId));
      toast.success("Xóa bài viết thành công!");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Có lỗi xảy ra khi xóa bài viết");
    }
  };

  const handleTogglePublish = async (
    blogId: string,
    currentStatus: boolean
  ) => {
    try {
      await updateDoc(doc(db, "blogs", blogId), {
        published: !currentStatus,
        updatedAt: new Date(),
      });

      setBlogs(
        blogs.map((blog) =>
          blog.id === blogId ? { ...blog, published: !currentStatus } : blog
        )
      );

      toast.success(
        `${!currentStatus ? "Xuất bản" : "Ẩn"} bài viết thành công!`
      );
    } catch (error) {
      console.error("Error updating blog status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái bài viết");
    }
  };

  const stats = {
    total: blogs.length,
    published: blogs.filter((blog) => blog.published).length,
    draft: blogs.filter((blog) => !blog.published).length,
    today: blogs.filter((blog) => {
      const today = new Date();
      const blogDate = blog.createdAt;
      return (
        blogDate &&
        blogDate.getDate() === today.getDate() &&
        blogDate.getMonth() === today.getMonth() &&
        blogDate.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý bài viết
          </h1>
          <p className="text-muted-foreground mt-2">
            Xem và quản lý tất cả bài viết trong hệ thống
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng bài viết
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết, tác giả, danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | "published" | "draft") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bài viết ({filteredBlogs.length})</CardTitle>
            <CardDescription>
              Quản lý tất cả bài viết trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all"
                            ? "Không tìm thấy bài viết nào"
                            : "Chưa có bài viết nào"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBlogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium line-clamp-1">
                              {blog.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {blog.content
                                .replace(/<[^>]*>/g, "")
                                .substring(0, 100)}
                              ...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/user/${blog.authorId}`}
                            className="text-primary hover:underline"
                          >
                            {blog.authorName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{blog.categoryName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={blog.published ? "default" : "secondary"}
                          >
                            {blog.published ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã xuất bản
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Bản nháp
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {blog.createdAt?.toLocaleDateString("vi-VN")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/blog/${blog.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleTogglePublish(blog.id, blog.published)
                                }
                              >
                                {blog.published ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Ẩn bài viết
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Xuất bản
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(blog.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa bài viết
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
