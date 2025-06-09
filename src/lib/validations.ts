import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "Tên hiển thị là bắt buộc")
      .min(2, "Tên hiển thị phải có ít nhất 2 ký tự")
      .max(50, "Tên hiển thị không được quá 50 ký tự"),
    email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(100, "Mật khẩu không được quá 100 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const blogSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề là bắt buộc")
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(200, "Tiêu đề không được quá 200 ký tự"),
  content: z
    .string()
    .min(1, "Nội dung là bắt buộc")
    .min(50, "Nội dung phải có ít nhất 50 ký tự"),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
  imageUrl: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
  tags: z.string().min(1, "Ít nhất một thẻ là bắt buộc"),
  published: z.boolean().default(false).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BlogFormData = z.infer<typeof blogSchema>;
