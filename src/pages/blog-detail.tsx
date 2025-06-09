import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Blog } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  ArrowLeft,
  Clock,
  Eye,
  LoaderCircle,
} from "lucide-react";

export const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Đang tải bài viết...";
    const fetchBlog = async () => {
      if (!id) {
        setLoading(false);
        document.title = "Không tìm thấy bài viết";
        return;
      }

      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const blogData = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate(),
          } as Blog;
          setBlog(blogData);
          document.title = blogData.title;
        } else {
          document.title = "Không tìm thấy bài viết";
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        document.title = "Lỗi tải bài viết";
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textLength = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.ceil(textLength / wordsPerMinute);
    return readingTime < 1 ? 1 : readingTime;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang chủ
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
      <article className="bg-card rounded-lg shadow-sm overflow-hidden">
        {blog.imageUrl && (
          <div className="w-full h-[400px] overflow-hidden">
            <img
              src={blog.imageUrl || "/placeholder.svg"}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="px-3 py-1">{blog.categoryName}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {blog.createdAt?.toLocaleDateString("vi-VN")}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                <Link
                  to={`/user/${blog.authorId}`}
                  className="hover:text-primary transition-colors hover:underline"
                >
                  {blog.authorName}
                </Link>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {getReadingTime(blog.content)} phút đọc
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                {Math.floor(Math.random() * 100) + 10} lượt xem
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
          <footer className="mt-12 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {blog.updatedAt && blog.updatedAt > blog.createdAt && (
                  <p>
                    Cập nhật lần cuối:{" "}
                    {blog.updatedAt.toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
};
