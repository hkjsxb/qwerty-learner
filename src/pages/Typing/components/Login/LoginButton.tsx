import { IconLogin } from '@/pages/Typing/components/Login/icon/IconLogin'
import { recordErrorBookAction } from '@/utils'
import { Notification } from '@arco-design/web-react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginButton = () => {
  const navigate = useNavigate()

  const login = useCallback(() => {
    // 如果token存在则终止登录
    if (localStorage.getItem('token')) {
      Notification.info({
        title: '已登录',
        content: '你已经是登录状态了，请勿重复登录',
        showIcon: true,
        position: 'bottomRight',
      })
      return null
    }
    navigate('/login')
    recordErrorBookAction('open')
  }, [navigate])

  return (
    <button
      type="button"
      onClick={login}
      className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white`}
      title="登录"
    >
      <IconLogin className="icon" />
    </button>
  )
}

export default LoginButton
