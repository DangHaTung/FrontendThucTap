import { z } from "zod";

 export const loginSchema = z.object({
    email: z.string().min(1, "Email không được bỏ trống"),
    password: z.string().min(6, "Mật khẩu phải đủ 6 kí tự")
 })
 export type IAuth = z.infer<typeof loginSchema>