import { useContext } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import CryptoJS from 'crypto-js'

import { ChatContext } from '../contexts/ChatContext'
import AuthService from '../services/auth.service'

const loginFormValidationSchema = zod.object({
  email: zod.string().min(1, 'Informe o email'),
  password: zod.string().min(1, 'Informe sua senha'),
})

export type LoginFormData = zod.infer<typeof loginFormValidationSchema>

export function Login() {
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormValidationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { handleSubmit, watch, reset, register } = loginForm

  const navigate = useNavigate()
  const { updateUserData } = useContext(ChatContext)

  async function loginUser(data: LoginFormData) {
    // localStorage.setItem('@encrypted-chat:user-pkey-1.0.0', privateKey)
    data.password = CryptoJS.MD5(data.password).toString()

    const response = await AuthService.login(data)

    if (response.status === 200) {
      navigate('/messages')
    } else {
      alert('Password or email incorrect')
    }
  }

  function handleLoginUser(data: LoginFormData) {
    loginUser(data).then((response) => {
      const user = JSON.parse(
        localStorage.getItem('@encrypted-chat:user-1.0.0') || '{}',
      )
      updateUserData(user)
      reset()
    })
  }

  const email = watch('email')
  const password = watch('password')
  const isSubmitDisable = !email && !password

  return (
    <div className="flex flex-col h-screen justify-between">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to={'/register'}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create your account now!
          </Link>
        </p>
      </div>
      <div className="mb-auto flex items-center justify-center">
        <div className="px-8 py-6 mx-4 mt-4 text-left bg-white shadow-lg rounded-lg md:w-1/3 lg:w-1/3 sm:w-1/3">
          <form
            onSubmit={handleSubmit(handleLoginUser)}
            className="flex flex-col justify-start gap-2"
          >
            <FormProvider {...loginForm}>
              <label className="block text-gray-600" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="jhondoe@example.com"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
                {...register('email')}
              />
              <label className="block text-gray-600" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="************"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
                {...register('password')}
              />
              <button
                type="submit"
                disabled={isSubmitDisable}
                className="mt-4 group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Login
              </button>
            </FormProvider>
          </form>
        </div>
      </div>
    </div>
  )
}
