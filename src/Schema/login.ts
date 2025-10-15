import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email không được bỏ trống").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải đủ 6 kí tự"),
});

export type ILogin = z.infer<typeof loginSchema>;
