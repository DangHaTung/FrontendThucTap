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
      <div className="w-[500px] mx-auto mt-10 shadow-lg p-10 rounded">
        <h1 className="text-2xl font-bold mb-5 text-center">Login</h1>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
                className={`bg-gray-50 border border-gray-300 rounded-lg block w-full p-2 hover:border-blue-500 hover:bg-zinc-100 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className='text-red-500'>{errors.email.message}</p>
            )}
          </div>
          <div className="mb-5">
            <label htmlFor="price" className="block mb-2">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className={`bg-gray-50 border border-gray-300 rounded-lg block w-full p-2 hover:border-blue-500 hover:bg-zinc-100 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.password && (
              <p className='text-red-500'>{errors.password.message}</p>
            )}
          </div>
          <div className='flex justify-between'>
            <i className="bi bi-arrow-left hover: hover:text-blue-500 "><a onClick={back}>Back</a></i>
            <button
              type="submit"
              disabled={isLoading}
              className={`text-white mt-5 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-800'
              }`}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Submit'}
            </button>
          </div>

        </form>
      </div>
    </>
  )
}

export default Login