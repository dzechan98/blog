import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { Blog } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard";
    const fetchUserBlogs = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching blogs for user:", currentUser.uid);
        const q = query(
          collection(db, "blogs"),
          where("authorId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size);
        console.log("Query snapshot empty:", querySnapshot.empty);

        const blogsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Blog data:", { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }) as Blog[];

        console.log("Processed blogs data:", blogsData);
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, [currentUser]);

  const handleDelete = async (blogId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      await deleteDoc(doc(db, "blogs", blogId));
      setBlogs(blogs.filter((blog) => blog.id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Có lỗi xảy ra khi xóa bài viết");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button asChild>
          <Link to="/create-blog">
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài viết mới
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tổng bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đã xuất bản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {blogs.filter((blog) => blog.published).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bản nháp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {blogs.filter((blog) => !blog.published).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Bài viết của bạn</h2>

        {blogs.length === 0 ? (
          <Alert>
            <AlertDescription>
              Bạn chưa có bài viết nào.
              <Link
                to="/create-blog"
                className="text-blue-600 hover:underline ml-1"
              >
                Tạo bài viết đầu tiên
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <Card key={blog.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{blog.title}</CardTitle>
                        <Badge
                          variant={blog.published ? "default" : "secondary"}
                        >
                          {blog.published ? "Đã xuất bản" : "Bản nháp"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {blog.content.replace(/<[^>]*>/g, "").substring(0, 100)}
                        ...
                      </CardDescription>
                      <div className="text-sm text-gray-500">
                        Danh mục: {blog.categoryName} • Tạo:{" "}
                        {blog.createdAt?.toLocaleDateString("vi-VN")}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blog/${blog.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/edit-blog/${blog.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
