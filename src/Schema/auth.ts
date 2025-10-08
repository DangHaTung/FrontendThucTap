import { z } from "zod";

 export const authSchema = z.object({
    username: z.string().min(1, "Tên không được bỏ trống"),
    email: z.string().min(1, "Email không được bỏ trống"),
    password: z
    .string()
    .min(6, "Mật khẩu phải đủ 6 ký tự")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
    .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt")
    .regex(/^\S+$/, "Mật khẩu không được có dấu cách"),
 })
 export type IAuth = z.infer<typeof authSchema>