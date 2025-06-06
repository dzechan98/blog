import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogSchema, type BlogFormData } from "@/lib/validations";
import { uploadImageToImgbb } from "@/lib/image-upload";
import { X, ImageIcon, Loader2 } from "lucide-react";

export const CreateBlog: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      imageUrl: "",
      published: false,
      tags: "",
    },
  });

  useEffect(() => {
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
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    form.setValue("imageUrl", "");
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!currentUser || !userProfile) return;

    try {
      setError("");

      let imageUrl = data.imageUrl || "";

      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToImgbb(imageFile);
        } catch (uploadError) {
          console.log(uploadError);
          setError("Không thể tải ảnh lên. Vui lòng thử lại.");
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const selectedCategory = categories.find(
        (cat) => cat.id === data.categoryId
      );
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      await addDoc(collection(db, "blogs"), {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        categoryName: selectedCategory?.name || "",
        authorId: currentUser.uid,
        authorName: userProfile.displayName,
        published: data.published,
        imageUrl,
        tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating blog:", error);
      setError("Có lỗi xảy ra khi tạo bài viết");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Tạo bài viết mới</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề bài viết" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Ảnh bài viết</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Kéo thả ảnh vào đây hoặc click để chọn
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF tối đa 5MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          Chọn ảnh
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập các tag, cách nhau bằng dấu phẩy"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Ví dụ: công nghệ, lập trình, web development
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Viết nội dung bài viết của bạn..."
                        rows={15}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Xuất bản ngay</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || uploadingImage}
                >
                  {form.formState.isSubmitting || uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadingImage ? "Đang tải ảnh..." : "Đang tạo..."}
                    </>
                  ) : (
                    "Tạo bài viết"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
