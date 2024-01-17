import Layout from '@/components/Layout'
import { Button, Card, Form, Input } from '@arco-design/web-react'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export default function AddWordPage() {
  const navigate = useNavigate()
  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])
  const FormItem = Form.Item

  useHotkeys('esc', onBack, { preventDefault: true })

  return (
    <Layout>
      <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
          <Card style={{ width: 600 }} title="单词录入">
            <Form autoComplete="off" colon={true}>
              <FormItem label="英文" field="name" required>
                <Input placeholder="请输入英文或短语" />
              </FormItem>
              <FormItem label="中文" field="trans" required>
                <Input placeholder="请输入中文释义" />
              </FormItem>
              <FormItem label="音标（美）" field="usphone">
                <Input placeholder="请输入美音音标" />
              </FormItem>
              <FormItem label="音标（英）" field="ukphone">
                <Input placeholder="请输入英音音标" />
              </FormItem>

              <FormItem wrapperCol={{ offset: 5 }}>
                <Button type="primary">保存</Button>
              </FormItem>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
