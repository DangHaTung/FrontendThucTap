import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  username: z.string().min(3, "Tên người dùng phải ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu phải ít nhất 6 ký tự"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu và xác nhận mật khẩu không khớp",
  path: ["confirmPassword"],
});
