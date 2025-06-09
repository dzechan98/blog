import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { Blog, Category } from "@/types";
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
  User,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Users,
  FileText,
} from "lucide-react";
import { BlogFilters, type FilterState } from "@/components/blog-filters";

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalUsers: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    sortBy: "newest",
  });

  const filteredBlogs = useMemo(() => {
    let filtered = [...allBlogs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchLower) ||
          blog.content.toLowerCase().includes(searchLower) ||
          blog.authorName.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        (blog) => blog.categoryId === filters.category
      );
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "oldest":
          return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "newest":
        default:
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      }
    });

    return filtered;
  }, [allBlogs, filters]);

  const featuredBlogs = filteredBlogs.slice(0, 3);
  const recentBlogs = filteredBlogs.slice(3, 12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blogsQuery = query(
          collection(db, "blogs"),
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const blogsSnapshot = await getDocs(blogsQuery);

        const blogsData = blogsSnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }) as Blog[];

        setAllBlogs(blogsData);

        const categoriesQuery = query(
          collection(db, "categories"),
          orderBy("name"),
          limit(6)
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Category[];
        setCategories(categoriesData);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const allCategoriesSnapshot = await getDocs(
          collection(db, "categories")
        );

        setStats({
          totalBlogs: blogsData.length,
          totalUsers: usersSnapshot.size,
          totalCategories: allCategoriesSnapshot.size,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 pt-16">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pt-16">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Chào mừng đến với{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BlogApp
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Khám phá những bài viết thú vị, chia sẻ kiến thức và kết nối với
            cộng đồng yêu thích viết lách. Nơi mọi ý tưởng đều có giá trị và mọi
            câu chuyện đều đáng được kể.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!currentUser ? (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">
                    Bắt đầu viết blog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </>
            ) : (
              <Button size="lg" asChild>
                <Link to="/create-blog">
                  Tạo bài viết mới
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="text-center">
          <CardHeader>
            <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <CardTitle className="text-2xl font-bold">
              {stats.totalBlogs}
            </CardTitle>
            <CardDescription>Bài viết đã đăng</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-2xl font-bold">
              {stats.totalUsers}
            </CardTitle>
            <CardDescription>Thành viên tham gia</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <BookOpen className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <CardTitle className="text-2xl font-bold">
              {stats.totalCategories}
            </CardTitle>
            <CardDescription>Danh mục chủ đề</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Filters */}
      <BlogFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={filteredBlogs.length}
      />

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center">
                <TrendingUp className="h-8 w-8 mr-3 text-orange-600" />
                {filters.search || filters.category
                  ? "Kết quả tìm kiếm"
                  : "Bài viết nổi bật"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {filters.search || filters.category
                  ? "Các bài viết phù hợp với bộ lọc của bạn"
                  : "Những bài viết mới nhất và được quan tâm nhiều nhất"}
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {featuredBlogs.map((blog, index) => (
              <Card
                key={blog.id}
                className={`hover:shadow-xl transition-all duration-300 pt-0 overflow-hidden ${
                  index === 0 && !filters.search && !filters.category
                    ? "lg:col-span-2 lg:row-span-2"
                    : ""
                }`}
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
                  <CardTitle
                    className={`line-clamp-2 ${
                      index === 0 && !filters.search && !filters.category
                        ? "text-2xl"
                        : "text-lg"
                    }`}
                  >
                    <Link
                      to={`/blog/${blog.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </CardTitle>
                  <CardDescription
                    className={`${
                      index === 0 && !filters.search && !filters.category
                        ? "line-clamp-4"
                        : "line-clamp-3"
                    }`}
                  >
                    {blog.content
                      ? blog.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                        "..."
                      : "Không có nội dung"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      <span>Bởi {blog.authorName}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/blog/${blog.id}`}>
                        Đọc thêm
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
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
        </section>
      )}

      {/* Categories Section - Only show if no filters applied */}
      {categories.length > 0 && !filters.search && !filters.category && (
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Khám phá theo chủ đề
            </h2>
            <p className="text-muted-foreground">
              Tìm hiểu các bài viết theo từng lĩnh vực quan tâm
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recent Blogs */}
      {recentBlogs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {filters.search || filters.category
                  ? "Thêm kết quả"
                  : "Bài viết gần đây"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {filters.search || filters.category
                  ? "Các bài viết khác phù hợp"
                  : "Cập nhật những nội dung mới nhất từ cộng đồng"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.map((blog) => (
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
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span>Bởi {blog.authorName}</span>
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
        </section>
      )}

      {!filters.search && !filters.category && (
        <section className="text-center py-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Sẵn sàng chia sẻ câu chuyện của bạn?
            </h2>
            <p className="text-muted-foreground mb-6">
              Tham gia cộng đồng BlogApp để chia sẻ kiến thức, kinh nghiệm và
              kết nối với những người có cùng đam mê.
            </p>
            {!currentUser ? (
              <Button size="lg" asChild>
                <Link to="/register">
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Đi tới Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredBlogs.length === 0 && (
        <section className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            {allBlogs.length === 0
              ? "Chưa có bài viết nào"
              : "Không tìm thấy bài viết"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {allBlogs.length === 0
              ? "Hãy là người đầu tiên chia sẻ câu chuyện của bạn!"
              : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
          </p>
          {currentUser && allBlogs.length === 0 && (
            <Button asChild>
              <Link to="/create-blog">Tạo bài viết đầu tiên</Link>
            </Button>
          )}
        </section>
      )}
    </div>
  );
};
