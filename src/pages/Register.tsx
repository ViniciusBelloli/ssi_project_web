import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
import * as zod from 'zod'
import * as openpgp from 'openpgp'
import CryptoJS from 'crypto-js'

import { api } from '../lib/axios'

const newUserFormValidationSchema = zod.object({
  name: zod.string().min(1, 'Informe o usuário'),
  email: zod.string().min(1, 'Informe o email'),
  password: zod.string().min(1, 'Informe sua senha'),
  userPublicKey: zod.string(),
  userRevokeKey: zod.string(),
})

type NewUserFormData = zod.infer<typeof newUserFormValidationSchema>

export function Register() {
  const newUserForm = useForm<NewUserFormData>({
    resolver: zodResolver(newUserFormValidationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userPublicKey: '',
      userRevokeKey: '',
    },
  })

  const navigate = useNavigate()

  const { handleSubmit, watch, reset, register } = newUserForm

  async function createUser(data: NewUserFormData) {
    data.password = CryptoJS.MD5(data.password).toString()

    const { privateKey, publicKey, revocationCertificate } =
      await openpgp.generateKey({
        type: 'ecc', // Type of the key, defaults to ECC
        curve: 'curve25519', // ECC curve name, defaults to curve25519
        userIDs: [{ name: data.name, email: data.email }], // you can pass multiple user IDs
        passphrase: data.password, // protects the private key
        format: 'armored', // output key format, defaults to 'armored' (other options: 'binary' or 'object')
      })

    data.userPublicKey = Buffer.from(publicKey).toString('base64')
    data.userRevokeKey = Buffer.from(revocationCertificate).toString('base64')
    const privateBase = Buffer.from(privateKey).toString('base64')

    localStorage.setItem('@encrypted-chat:user-pkey-1.0.0', privateBase)

    const response = await api.post('/users', data)

    if (response.status === 201) {
      navigate('/')
    } else {
      alert('Erro ao criar usuário')
    }
  }

  function handleCreateNewUser(data: NewUserFormData) {
    createUser(data)
    reset()
  }

  const name = watch('name')
  const email = watch('email')
  const password = watch('password')
  const isSubmitDisable = !name && !email && !password

  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="mb-auto flex items-center justify-center min-h-screen">
        <div className="px-8 py-6 mx-4 mt-4 text-left bg-white shadow-lg rounded-lg md:w-1/3 lg:w-1/3 sm:w-1/3">
          <form
            onSubmit={handleSubmit(handleCreateNewUser)}
            className="flex flex-col justify-start gap-2"
          >
            <FormProvider {...newUserForm}>
              <label className="block text-gray-600" htmlFor="name">
                Login
              </label>
              <input
                id="name"
                placeholder="JhonDoe"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                required
                {...register('name')}
              />
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
                Cadastrar
              </button>
            </FormProvider>
          </form>
        </div>
      </div>
    </div>
  )
}
