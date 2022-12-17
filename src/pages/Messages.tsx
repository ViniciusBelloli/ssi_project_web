import { useEffect, useState } from 'react'
import { PaperPlaneRight } from 'phosphor-react'
import { Buffer } from 'buffer'
import { useNavigate } from 'react-router-dom'
import UserService from '../services/user.service'
import * as openpgp from 'openpgp'
import AuthService from '../services/auth.service'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const latestUserMessage = localStorage.getItem(
  '@encrypted-chat:latest-user-message-1.0.0',
)

const user = JSON.parse(
  localStorage.getItem('@encrypted-chat:user-1.0.0') || '{}',
)

interface UserResponseProps {
  avatarUrl: string
  createdAt: Date
  email: string
  id: string
  name: string
  userPublicKey: string
}

interface MessageProps {
  userFrom: string
  userReceive: string
  message: string
  createdAt: string
}

export function Messages() {
  const [users, setUsers] = useState<UserResponseProps[]>([])
  const [message, setMessage] = useState('')
  const [idSelected, setIdSelected] = useState(latestUserMessage || '')
  const [messageList, setMessageList] = useState<MessageProps[]>([])
  const navigate = useNavigate()

  async function onHandleMessageSend(messageSended: string) {
    const privateSaved = JSON.parse(
      localStorage.getItem('@encrypted-chat:user-pkey-1.0.0') || '[]',
    )

    const user = JSON.parse(
      localStorage.getItem('@encrypted-chat:user-1.0.0') || '{}',
    )

    const resultFind = privateSaved.filter(
      (element: any) => element.idUser === user.id,
    )

    if (!(resultFind.length === 1)) {
      alert('Erro ao encontrar chaves do usuário.')
      return
    }

    const publicKeyArmored = Buffer.from(user.userPublicKey, 'base64').toString(
      'ascii',
    )

    const privateKeyArmored = Buffer.from(
      resultFind[0].privateBaseKey,
      'base64',
    ).toString('ascii')

    const passphrase = resultFind[0].privateBasePass

    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored })
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: privateKeyArmored,
      }),
      passphrase,
    })

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: messageSended }), // input as Message object
      encryptionKeys: publicKey,
      signingKeys: privateKey, // optional
    })

    const dataPost = {
      userFrom: user.id,
      userReceive: idSelected,
      message: String(encrypted),
    }

    UserService.postMessage(dataPost)
      .then((response) => response.data)
      .then(async (data: MessageProps) => {
        const decryptedMessage = await decryptMessage(
          data.message,
          data.userFrom,
        )

        const dataAddArray = {
          userFrom: data.userFrom,
          userReceive: data.userReceive,
          message: decryptedMessage || '',
          createdAt: data.createdAt,
        }

        setMessage('')
        setIdSelected(idSelected)
        setMessageList((prev) => [...prev, dataAddArray])
      })
  }

  async function decryptMessage(encrypted: string, userFrom: string) {
    const privateSaved = JSON.parse(
      localStorage.getItem('@encrypted-chat:user-pkey-1.0.0') || '[]',
    )

    const user = JSON.parse(
      localStorage.getItem('@encrypted-chat:user-1.0.0') || '{}',
    )

    const resultFind = privateSaved.filter(
      (element: any) => element.idUser === userFrom,
    )

    if (!(resultFind.length === 1)) {
      alert('Erro ao encontrar chaves do usuário.')
      return
    }

    const publicKeyArmored = Buffer.from(user.userPublicKey, 'base64').toString(
      'ascii',
    )

    const privateKeyArmored = Buffer.from(
      resultFind[0].privateBaseKey,
      'base64',
    ).toString('ascii')

    const passphrase = resultFind[0].privateBasePass

    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored })
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: privateKeyArmored,
      }),
      passphrase,
    })

    const message = await openpgp.readMessage({
      armoredMessage: encrypted, // parse armored message
    })

    const { data: decrypted } = await openpgp.decrypt({
      message,
      config: {
        allowInsecureDecryptionWithSigningKeys: true,
      },
      verificationKeys: publicKey,
      decryptionKeys: privateKey,
    })

    return decrypted.toString()
  }

  function logout() {
    AuthService.logout()
    navigate('/')
  }

  function onHandleUserSelect(userId: string) {
    localStorage.setItem('@encrypted-chat:latest-user-message-1.0.0', userId)
    setIdSelected(userId)
  }

  useEffect(() => {
    UserService.getUsers(user.id)
      .then((response) => response.data)
      .then((data) => {
        localStorage.setItem(
          '@encrypted-chat:latest-user-message-1.0.0',
          data[0].id,
        )

        setIdSelected(data[0].id)
        setUsers(data)
      })
  }, [])

  useEffect(() => {
    async function getData() {
      const dataPost = {
        userFrom: user.id,
        userReceive: idSelected,
      }

      const dataReceive: MessageProps[] = []
      const respMessages = await UserService.getMessages(dataPost)

      // if (messageList.length > 0) {
      //   return
      // }
      await Promise.all(
        respMessages.data.map(async (respMessage: any) => {
          const decryptedMessage = await decryptMessage(
            respMessage.message,
            respMessage.userFrom,
          )

          dataReceive.push({
            userFrom: respMessage.userFrom,
            userReceive: respMessage.userReceive,
            message: decryptedMessage || '',
            createdAt: respMessage.createdAt,
          })
        }),
      )

      setMessageList(dataReceive)
    }

    getData()
  }, [idSelected])

  return (
    <div className="container mx-auto shadow-lg rounded-lg">
      <div className="px-5 py-5 flex justify-between items-center bg-white border-b-2">
        <div className="font-semibold text-2xl">Encrypted chat</div>
        <div className="w-1/2">
          <input
            type="text"
            name=""
            id=""
            placeholder="search IRL"
            className="rounded-2xl bg-gray-100 py-3 px-5 w-full"
          />
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div className="h-12 w-12 p-2 bg-yellow-500 rounded-full text-white font-semibold flex items-center justify-center">
              {user.userName.substring(0, 2).toUpperCase()}
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-white rounded-md shadow-lg p-4"
              sideOffset={5}
            >
              <DropdownMenu.Item
                onClick={logout}
                className="text-sm leading-3 flex items-center justify-center outline-none rounded cursor-pointer"
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* users and messages */}
      <div className="flex flex-row justify-between bg-white">
        {/* users */}
        <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
          <div className="border-b-2 py-4 px-2">
            <input
              type="text"
              placeholder="search chatting"
              className="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
            />
          </div>
          {users.map((user) => {
            const selectedClass =
              idSelected === user.id
                ? 'flex flex-row py-4 px-2 items-center border-b-2 border-l-4 border-blue-400'
                : 'flex flex-row py-4 px-2 justify-center items-center border-b-2 cursor-pointer'

            return (
              <div
                className={selectedClass}
                key={user.id}
                onClick={(e) => onHandleUserSelect(user.id)}
              >
                <div className="w-1/4">
                  <img
                    src="https://t3.ftcdn.net/jpg/02/09/37/00/360_F_209370065_JLXhrc5inEmGl52SyvSPeVB23hB6IjrR.jpg"
                    className="object-cover h-12 w-12 rounded-full"
                    alt=""
                  />
                </div>
                <div className="w-full">
                  <div className="text-lg font-semibold">{user.name}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* messages */}
        <div className="w-full px-5 flex flex-col justify-between">
          <div className="flex flex-col mt-5">
            {messageList.length > 0 ? (
              messageList.map((messages, index) => {
                const { userFrom, createdAt, message } = messages
                const keyUnique =
                  userFrom?.concat(createdAt) || index.toString()

                if (userFrom === user.id) {
                  return (
                    <div className="flex justify-end mb-4" key={keyUnique}>
                      <div className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white">
                        {message}
                      </div>
                      <img
                        src="https://t3.ftcdn.net/jpg/02/09/37/00/360_F_209370065_JLXhrc5inEmGl52SyvSPeVB23hB6IjrR.jpg"
                        className="object-cover h-8 w-8 rounded-full"
                        alt=""
                      />
                    </div>
                  )
                } else {
                  return (
                    <div className="flex justify-start mb-4" key={keyUnique}>
                      <img
                        src="https://t3.ftcdn.net/jpg/02/09/37/00/360_F_209370065_JLXhrc5inEmGl52SyvSPeVB23hB6IjrR.jpg"
                        className="object-cover h-8 w-8 rounded-full"
                        alt=""
                      />
                      <div className="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white">
                        {message}
                      </div>
                    </div>
                  )
                }
              })
            ) : (
              <></>
            )}
          </div>
          <div className="py-5 flex gap-2 justify-center items-center">
            <input
              className="w-full bg-gray-300 py-5 px-3 rounded-xl"
              type="text"
              placeholder="type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="bg-gray-300 py-5 px-3 rounded-xl"
              onClick={(e) => onHandleMessageSend(message)}
            >
              <PaperPlaneRight
                size={24}
                className="text-black hover:text-emerald-900"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
