import React, { FC, useCallback, useEffect, useState } from 'react'
import MessageBox from '../components/MessageBox'
import PrevButton from '../components/PrevButton'
import { IngredientType, MessageType } from '../lib/types'
import { MoonLoader } from 'react-spinners'

interface ChatProps {
  ingredientList: IngredientType[]
  endpoint: string
}

const Chat: FC<ChatProps> = ({ ingredientList, endpoint }): JSX.Element => {
  // logic

  const [value, setValue] = useState('')
  const [infoMessages, setInfoMessages] = useState<MessageType[]>([])
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isInfoLoading, setIsInfoLoading] = useState(true)
  const [isMessageLoading, setIsMessageLoading] = useState(false)

  const hadleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target
    setValue(value)
  }

  const hadleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const userMessage: MessageType = { role: 'user', content: value.trim() }
    setMessages((prev) => [...prev, userMessage])
    sendMessage(userMessage)
    setValue('') // input 초기화
  }

  const sendMessage = async (userMessage: MessageType): Promise<void> => {
    setIsMessageLoading(true)
    try {
      const response = await fetch(`${endpoint}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, messages: [...infoMessages, ...messages] }),
      })
      const result = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: result.data.content }])
    } catch (error) {
      console.error(error)
    }
    setIsMessageLoading(false)
  }

  const sendInfo = useCallback(async (): Promise<void> => {
    // TODO: 로딩 스피너 on
    setIsInfoLoading(true)
    try {
      const response = await fetch(`${endpoint}/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientList }),
      })
      const result = await response.json()

      // 데이터가 잘 들어온 경우만 실행
      if (!result.data) return
      const removeLastDataList = result.data.filter(
        (_: MessageType, index: number, arr: MessageType[]) => index !== arr.length - 1,
      )
      console.log('🚀 ~ sendInfo ~ removeLastDataList:', removeLastDataList)
      setInfoMessages(removeLastDataList)

      // 마지막 요소인 assistant값 저장
      const { role, content } = result.data[result.data.length - 1]

      setMessages((prev) => [...prev, { role, content }])
    } catch (error) {
      console.error(error)
    }
    setIsInfoLoading(false)
    // TODO: 로딩 스피너 off
  }, [endpoint, ingredientList])

  useEffect(() => {
    ingredientList.length && sendInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendInfo])

  // view
  return (
    <div className="w-full h-full px-6 pt-10 break-keep overflow-auto">
      {isInfoLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MoonLoader color="#46A195" />
          </div>
        </div>
      )}

      {/* START: 로딩 스피너 */}
      {/* START:뒤로가기 버튼 */}
      <PrevButton />
      {/* END:뒤로가기 버튼 */}
      <div className="h-full flex flex-col">
        {/* START:헤더 영역 */}
        <div className="-mx-6 -mt-10 py-7 bg-chef-green-500">
          <span className="block text-xl text-center text-white">맛있는 쉐프</span>
        </div>
        {/* END:헤더 영역 */}
        {/* START:채팅 영역 */}
        <div className="overflow-auto">
          <MessageBox messages={messages} name={'맛있는 쉐프'} isLoading={isMessageLoading} />
        </div>
        {/* END:채팅 영역 */}
        {/* START:메시지 입력 영역 */}
        <div className="mt-auto flex py-5 -mx-2 border-t border-gray-100">
          <form id="sendForm" className="w-full px-2 h-full" onSubmit={hadleSubmit}>
            <input
              className="w-full text-sm px-3 py-2 h-full block rounded-xl bg-gray-100 focus:"
              type="text"
              name="message"
              value={value}
              onChange={hadleChange}
            />
          </form>
          <button
            type="submit"
            form="sendForm"
            className="w-10 min-w-10 h-10 inline-block rounded-full bg-chef-green-500 text-none px-2 bg-[url('../public/images/send.svg')] bg-no-repeat bg-center">
            보내기
          </button>
        </div>
        {/* END:메시지 입력 영역 */}
      </div>
    </div>
  )
}

export default Chat
