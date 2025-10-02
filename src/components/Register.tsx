import React from 'react'
import { useForm } from 'react-hook-form'
import { authSchema, type IAuth } from '../Schema/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useNavigate } from 'react-router'


const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IAuth>({ resolver: zodResolver(authSchema) })
  const nav = useNavigate()
    const back = () => {
    nav(-1)
  }
  const onSubmit = async (value: IAuth) => {
    await axios.post("http://localhost:3000/api/register", value)
    nav('/login')
  }
  return (
    <>
      <div className="w-[500px] mx-auto mt-10 shadow-lg p-10 rounded">
        <h1 className="text-2xl font-bold mb-5 text-center">Register</h1>
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2">
              Username
            </label>
            <input
              {...register('username')}
              type="text"
              id="username"
             className={`bg-gray-50 border border-gray-300 rounded-lg block w-full p-2 hover:border-blue-500 hover:bg-zinc-100 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.username && (
              <p className='text-red-500 '>{errors.username.message}</p>
            )}
          </div>
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
              className="text-white mt-5 bg-blue-500 hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Register