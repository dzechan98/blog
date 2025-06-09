import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Search,
  Calendar,
  LoaderCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "@/components/admin/layout";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục là bắt buộc")
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(50, "Tên danh mục không được quá 50 ký tự"),
  description: z
    .string()
    .min(1, "Mô tả là bắt buộc")
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(200, "Mô tả không được quá 200 ký tự"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const Categories: React.FC = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    document.title = "Quản lý danh mục - Admin";
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Category[];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Có lỗi xảy ra khi tải danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: CategoryFormData) => {
    if (!currentUser) return;

    try {
      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), {
          name: data.name,
          description: data.description,
          updatedAt: new Date(),
        });

        setCategories(
          categories.map((cat) =>
            cat.id === editingCategory.id
              ? { ...cat, name: data.name, description: data.description }
              : cat
          )
        );
        toast.success("Cập nhật danh mục thành công!");
      } else {
        const docRef = await addDoc(collection(db, "categories"), {
          name: data.name,
          description: data.description,
          createdBy: currentUser.uid,
          createdAt: new Date(),
        });

        const newCategory: Category = {
          id: docRef.id,
          name: data.name,
          description: data.description,
          createdBy: currentUser.uid,
          createdAt: new Date(),
        };

        setCategories([...categories, newCategory]);
        toast.success("Tạo danh mục thành công!");
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Có lỗi xảy ra khi lưu danh mục");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setValue("name", category.name);
    form.setValue("description", category.description);
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      await deleteDoc(doc(db, "categories", categoryId));
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      toast.success("Xóa danh mục thành công!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Có lỗi xảy ra khi xóa danh mục");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Quản lý danh mục
            </h1>
            <p className="text-muted-foreground mt-2">
              Tạo và quản lý các danh mục cho bài viết
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo danh mục
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Cập nhật thông tin danh mục"
                    : "Điền thông tin để tạo danh mục mới cho bài viết"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên danh mục</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên danh mục" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả cho danh mục"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
                        ? editingCategory
                          ? "Đang cập nhật..."
                          : "Đang tạo..."
                        : editingCategory
                        ? "Cập nhật"
                        : "Tạo danh mục"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng danh mục
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kết quả tìm kiếm
              </CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredCategories.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tạo hôm nay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  categories.filter((cat) => {
                    const today = new Date();
                    const catDate = cat.createdAt;
                    return (
                      catDate &&
                      catDate.getDate() === today.getDate() &&
                      catDate.getMonth() === today.getMonth() &&
                      catDate.getFullYear() === today.getFullYear()
                    );
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {category.createdAt?.toLocaleDateString("vi-VN")}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              {searchTerm ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm"
                : "Tạo danh mục đầu tiên để phân loại bài viết"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo danh mục đầu tiên
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
