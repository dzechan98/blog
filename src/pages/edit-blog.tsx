import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { Blog, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogSchema, type BlogFormData } from "@/lib/validations";
import { uploadImageToImgbb } from "@/lib/image-upload";
import { X, ImageIcon, Loader2, Edit, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export const EditBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

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
    document.title = "Chỉnh sửa bài viết";
    const fetchData = async () => {
      if (!id) {
        setInitialLoading(false);
        navigate("/dashboard"); // Or a 404 page
        return;
      }

      try {
        const blogDoc = await getDoc(doc(db, "blogs", id));
        if (blogDoc.exists()) {
          const blogData = blogDoc.data() as Blog;

          if (blogData.authorId !== currentUser?.uid) {
            toast.error("Bạn không có quyền chỉnh sửa bài viết này.");
            navigate("/dashboard");
            return;
          }
          document.title = `Chỉnh sửa: ${blogData.title}`;
          form.setValue("title", blogData.title);
          form.setValue("content", blogData.content);
          form.setValue("categoryId", blogData.categoryId);
          form.setValue("imageUrl", blogData.imageUrl || "");
          form.setValue("published", blogData.published);
          form.setValue("tags", blogData.tags.join(", "));

          if (blogData.imageUrl) {
            setCurrentImageUrl(blogData.imageUrl);
            setImagePreview(blogData.imageUrl);
          }
        } else {
          toast.error("Không tìm thấy bài viết.");
          document.title = "Không tìm thấy bài viết";
          navigate("/dashboard"); // Or a 404 page
        }

        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Category[];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
        document.title = "Lỗi tải dữ liệu";
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser, navigate, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCurrentImageUrl("");
    form.setValue("imageUrl", "");
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!id || !currentUser) return;

    try {
      let imageUrl = currentImageUrl;

      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToImgbb(imageFile);
        } catch (uploadError) {
          console.log(uploadError);
          toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
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

      await updateDoc(doc(db, "blogs", id), {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        categoryName: selectedCategory?.name || "",
        published: data.published,
        imageUrl,
        tags,
        updatedAt: new Date(),
      });

      toast.success("Cập nhật bài viết thành công");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Có lỗi xảy ra khi cập nhật bài viết");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <Edit className="h-6 w-6 mr-2" />
            Chỉnh sửa bài viết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Tiêu đề bài viết *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề bài viết" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid items-start grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl className="w-full">
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
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold">Ảnh</h3>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-60 object-contain rounded-lg"
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Nội dung bài viết *
                      </FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Viết nội dung bài viết của bạn..."
                          className="mb-6"
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
                      <FormLabel>Xuất bản bài viết</FormLabel>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || uploadingImage}
                  >
                    {form.formState.isSubmitting || uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadingImage
                          ? "Đang tải ảnh..."
                          : "Đang cập nhật..."}
                      </>
                    ) : (
                      "Cập nhật bài viết"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
