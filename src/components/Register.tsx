import { useForm } from 'react-hook-form'
import { authSchema, type IAuth } from '../Schema/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import api from '../api'
import toast from 'react-hot-toast'


const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IAuth>({ resolver: zodResolver(authSchema) })
  const nav = useNavigate()
    const back = () => {
    nav(-1)
  }
  const onSubmit = async (value: IAuth) => {
    await api.post('/register', value)
    toast.success('Đăng ký thành công')
    nav('/login')
  }
  return (
    <>
      <div className="w-[500px] mx-auto mt-10 shadow-lg p-10 rounded-lg bg-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Đăng Ký</h1>
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="username" className="block mb-2 font-medium text-gray-700">
              Tên Người Dùng
            </label>
            <input
              {...register('username')}
              type="text"
              id="username"
              className={`bg-gray-50 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg block w-full p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition duration-200`}
            />
            {errors.username && (
              <p className='text-red-500 text-sm mt-1'>{errors.username.message}</p>
            )}
          </div>
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
          <div className="mb-5">
            <label htmlFor="avatar" className="block mb-2 font-medium text-gray-700">
              Avatar (URL)
            </label>
            <input
              {...register('avatar')}
              type="text"
              id="avatar"
              className={`bg-gray-50 border ${errors.avatar ? 'border-red-500' : 'border-gray-300'} rounded-lg block w-full p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition duration-200`}
            />
            {errors.avatar && (
              <p className='text-red-500 text-sm mt-1'>{errors.avatar.message}</p>
            )}
          </div>
          <div className='flex justify-between items-center mb-5'>
            <i className="bi bi-arrow-left hover:text-blue-500 transition duration-200"><a onClick={back} className="cursor-pointer">Quay Lại</a></i>
            <div className="text-sm text-gray-600">
              <span>Đã có tài khoản?</span> <a href="/login" className="text-blue-500 hover:underline">Đăng nhập</a>
            </div>
          </div>
          <button
            type="submit"
            className="text-white font-medium rounded-lg text-sm w-full py-3 text-center transition duration-200 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Đăng Ký
          </button>
        </form>
      </div>
    </>
  )
}

export default Register