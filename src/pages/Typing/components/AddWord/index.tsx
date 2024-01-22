import type { responseDataType, wordBookRow } from '@/api/type/WordBookType'
import wordBookAPI from '@/api/wordBookAPI'
import Layout from '@/components/Layout'
import type { FormInstance } from '@arco-design/web-react'
import { Button, Card, Form, Input, Notification } from '@arco-design/web-react'
import { useCallback, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export default function AddWordPage() {
  const navigate = useNavigate()
  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])
  const FormItem = Form.Item
  const TextArea = Input.TextArea
  const formRef = useRef<FormInstance>(null)
  useHotkeys('esc', onBack, { preventDefault: true })

  const saveFn = (data: wordBookRow) => {
    wordBookAPI.addWords(data).then((res: responseDataType<string>) => {
      const { code, data, msg } = res
      if (typeof code === 'number' && code === 0) {
        Notification.success({
          title: '添加成功',
          content: data,
          showIcon: true,
          position: 'bottomRight',
        })
        // 清空表单输入的内容
        formRef?.current?.resetFields()
        return
      }
      Notification.error({
        title: '添加失败',
        content: msg,
        showIcon: true,
        position: 'bottomRight',
      })
    })
  }

  return (
    <Layout>
      <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
          <Card style={{ width: 600 }} title="单词录入">
            <Form autoComplete="off" colon={true} onSubmit={saveFn} ref={formRef}>
              <FormItem label="英文" field="name" rules={[{ required: true, message: '请输入单词或短语' }]}>
                <TextArea
                  placeholder="单词或短语"
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  showWordLimit
                  maxLength={{ length: 300, errorOnly: true }}
                />
              </FormItem>
              <FormItem label="中文" field="trans" rules={[{ required: true, message: '请输入中文释义' }]}>
                <TextArea placeholder="中文释义" autoSize={{ minRows: 2, maxRows: 6 }} />
              </FormItem>
              <FormItem label="音标（美）" field="usphone">
                <Input placeholder="美音音标" />
              </FormItem>
              <FormItem label="音标（英）" field="ukphone">
                <Input placeholder="英音音标" />
              </FormItem>

              <FormItem wrapperCol={{ offset: 5 }}>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
