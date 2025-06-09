/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { z } from "zod";
import { uploadImageToImgbb } from "@/lib/image-upload";
import { X, ImageIcon, Loader2, User, Save, EyeOff, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Tên hiển thị phải có ít nhất 2 ký tự")
    .max(50, "Tên hiển thị không được quá 50 ký tự"),
  bio: z.string().max(500, "Giới thiệu không được quá 500 ký tự").optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
    newPassword: z
      .string()
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
      .max(100, "Mật khẩu không được quá 100 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const EditProfile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    document.title = "Chỉnh sửa thông tin cá nhân";
    if (userProfile) {
      profileForm.setValue("displayName", userProfile.displayName || "");
      profileForm.setValue("bio", userProfile.bio || "");

      if (userProfile.avatar) {
        setCurrentAvatarUrl(userProfile.avatar);
        setAvatarPreview(userProfile.avatar);
      }
    }
  }, [userProfile, profileForm]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 2MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setCurrentAvatarUrl("");
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!currentUser) return;

    try {
      let avatarUrl = currentAvatarUrl;

      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          avatarUrl = await uploadImageToImgbb(avatarFile);
        } catch (uploadError) {
          console.log(uploadError);
          toast.error("Có lỗi xảy ra khi tải ảnh lên");
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      await updateProfile(currentUser, {
        displayName: data.displayName,
        photoURL: avatarUrl || null,
      });

      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        displayName: data.displayName,
        avatar: avatarUrl || null,
        bio: data.bio || null,
        updatedAt: new Date(),
      });

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!currentUser || !currentUser.email) return;

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        data.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, data.newPassword);

      passwordForm.reset();
      toast.success("Cập nhật mật khẩu thành công!");
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === "auth/invalid-credential") {
        toast.error("Mật khẩu hiện tại không chính xác");
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật mật khẩu");
      }
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <User className="h-6 w-6 mr-2" />
            Chỉnh sửa thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        {avatarPreview ? (
                          <div className="relative">
                            <img
                              src={avatarPreview || "/placeholder.svg"}
                              alt="Avatar"
                              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                              onClick={removeAvatar}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Chọn ảnh đại diện
                        </Button>
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG, GIF tối đa 2MB
                        </p>
                      </div>
                    </div>
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <Input
                        value={currentUser.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email không thể thay đổi
                      </p>
                    </FormItem>
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên hiển thị</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tên hiển thị" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giới thiệu</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Viết vài dòng giới thiệu về bản thân..."
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="submit"
                        disabled={
                          profileForm.formState.isSubmitting || uploadingAvatar
                        }
                        className="flex-1"
                      >
                        {profileForm.formState.isSubmitting ||
                        uploadingAvatar ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {uploadingAvatar
                              ? "Đang tải ảnh..."
                              : "Đang cập nhật..."}
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thông tin
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="password">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    {/* Current Password */}
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu hiện tại</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu hiện tại"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New Password */}
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu mới</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu mới"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Xác nhận mật khẩu</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu mới"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="submit"
                        disabled={passwordForm.formState.isSubmitting}
                        className="flex-1"
                      >
                        {passwordForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang cập nhật...
                          </>
                        ) : (
                          "Đổi mật khẩu"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
