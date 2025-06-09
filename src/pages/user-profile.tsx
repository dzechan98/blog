import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, Blog } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  UserIcon,
  ArrowLeft,
  BookOpen,
  FileText,
  Clock,
  Eye,
} from "lucide-react";

export const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = {
            id: userDoc.id,
            ...userDoc.data(),
            createdAt: userDoc.data().createdAt?.toDate(),
          } as User;
          setUser(userData);
        }

        const blogsQuery = query(
          collection(db, "blogs"),
          where("authorId", "==", userId),
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const blogsSnapshot = await getDocs(blogsQuery);
        const blogsData = blogsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Blog[];
        setUserBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textLength = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.ceil(textLength / wordsPerMinute);
    return readingTime < 1 ? 1 : readingTime;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy người dùng</h1>
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.displayName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {user.displayName}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              {user.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Giới thiệu</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Tham gia: {user.createdAt?.toLocaleDateString("vi-VN")}
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {userBlogs.length} bài viết
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Bài viết của {user.displayName}
          </h2>
          <Badge variant="outline" className="text-sm">
            {userBlogs.length} bài viết
          </Badge>
        </div>
        {userBlogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-muted-foreground">
                Người dùng này chưa xuất bản bài viết nào.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userBlogs.map((blog) => (
              <Card
                key={blog.id}
                className="pt-0 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {blog.imageUrl ? (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={blog.imageUrl || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{blog.categoryName}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {blog.createdAt?.toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link
                      to={`/blog/${blog.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {blog.content
                      ? blog.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                        "..."
                      : "Không có nội dung"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {getReadingTime(blog.content)} phút đọc
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {Math.floor(Math.random() * 100) + 10} lượt xem
                    </div>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {blog.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
