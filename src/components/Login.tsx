import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema, type IAuth } from '../Schema/login'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import toast from 'react-hot-toast'



const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IAuth>({ resolver: zodResolver(loginSchema) })
  const nav = useNavigate()
  const { login } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const back = () => {
    nav(-1)
  }
  const onSubmit = async (value: IAuth) => {
    setErrorMessage('')
    setIsLoading(true)
    
    try {
      const { data } = await api.post('/login', value)
      toast.success("Đăng nhập thành công")
      // Lấy token và username từ API response
      const token = data.token
      const username = data.data.username
      const userData = {
        id: data.data._id,
        username: data.data.username,
        email: data.data.email
      }
      
      login(username, token, userData)

      nav('/')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message)
      } else {
        setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      <div className="w-[500px] mx-auto mt-10 shadow-lg p-10 rounded-lg bg-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Đăng Nhập</h1>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg block w-full p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition duration-200`}
            />
            {errors.email && (
              <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
            )}
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
              Mật Khẩu
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className={`bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg block w-full p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition duration-200`}
            />
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>
            )}
          </div>
          <div className='flex justify-between items-center mb-5'>
            <i className="bi bi-arrow-left hover:text-blue-500 transition duration-200"><a onClick={back} className="cursor-pointer">Quay Lại</a></i>
            <div className="text-sm text-gray-600">
              <span>Bạn chưa có tài khoản?</span> <a href="/register" className="text-blue-500 hover:underline">Đăng ký</a>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`text-white font-medium rounded-lg text-sm w-full py-3 text-center transition duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            }`}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>

        </form>
      </div>
    </>
  )
}

export default Login