import authLoginAPI from '@/api/authLoginAPI'
import Layout from '@/components/Layout'
import { needLogin } from '@/store'
import { Button, Card, Form, Input, Notification } from '@arco-design/web-react'
import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export default function Login() {
  const navigate = useNavigate()
  const setNeedToLogIn = useSetAtom(needLogin)
  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])
  const FormItem = Form.Item

  useHotkeys('esc', onBack, { preventDefault: true })

  const saveFn = (data: { userName: string; password: string }) => {
    authLoginAPI.login(data).then((res) => {
      const { data } = res
      if (data && data.token) {
        Notification.success({
          title: '登录成功',
          content: '欢迎回来',
          showIcon: true,
          position: 'bottomRight',
        })
        setNeedToLogIn(false)
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.userID)
        localStorage.setItem('userName', data.username)
        localStorage.setItem('refreshToken', data.refreshToken)

        navigate('/')
      }
    })
  }

  return (
    <Layout>
      <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
          <Card style={{ width: 600 }} title="用户登录">
            <Form autoComplete="off" colon={true} onSubmit={saveFn}>
              <FormItem label="用户名" field="userName" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="输入用户名" height={40} />
              </FormItem>
              <FormItem label="密码" field="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password placeholder="输入密码" height={40} />
              </FormItem>

              <FormItem wrapperCol={{ offset: 5 }}>
                <Button type="primary" htmlType="submit">
                  登录
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
