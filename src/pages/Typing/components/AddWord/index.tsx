import type { responseDataType, wordBookRow } from '@/api/type/WordBookType'
import wordBookAPI from '@/api/wordBookAPI'
import Layout from '@/components/Layout'
import { defaultWordBookIdAtom, refreshWordBookAtom, refreshWordBookDescAtom } from '@/store'
import type { DictionaryResource } from '@/typings'
import type { FormInstance } from '@arco-design/web-react'
import { Button, Card, Form, Input, Notification, Select } from '@arco-design/web-react'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const Option = Select.Option
  const [bookNameOptions, setBookNameOptions] = useState<Array<string>>([])
  const [form] = Form.useForm()
  const [descCanEdit, setDescCanEdit] = useState(false)
  const [refreshBookSelectState, setBookSelectState] = useState(false)
  const setRefreshWordBookAtom = useSetAtom(refreshWordBookAtom)
  const [refreshWordBookDesc, setRefreshWordBookDescState] = useAtom(refreshWordBookDescAtom)
  const [defaultWordBookId, setDefaultWordBookId] = useAtom(defaultWordBookIdAtom)
  useHotkeys('esc', onBack, { preventDefault: true })

  const updateWordBookSelectData = useCallback(() => {
    // 从本地存储中获取单词本分类数据
    const remoteClassifiedData = localStorage.getItem('remoteClassifiedData')
    if (remoteClassifiedData) {
      const classifiedData: Array<DictionaryResource> = JSON.parse(remoteClassifiedData)
      const finalOptions = []
      for (let i = 0; i < classifiedData.length; i++) {
        const item = classifiedData[i]
        if (finalOptions.indexOf(item.name) === -1) {
          let finalName = item.name
          if (item.id.includes('-Phrase')) {
            // 去掉 Phrase
            finalName = finalName.slice(0, -7)
          }
          finalOptions.push(finalName)
        }
      }
      setBookNameOptions(finalOptions)
      // 设置默认单词本
      form.setFieldsValue({ bookName: defaultWordBookId })
    }
  }, [defaultWordBookId, form])

  // 设置单词本描述
  const setDescription = useCallback(
    (value: string) => {
      const remoteClassifiedData = localStorage.getItem('remoteClassifiedData')
      if (remoteClassifiedData) {
        const classifiedData: Array<DictionaryResource> = JSON.parse(remoteClassifiedData)
        for (let i = 0; i < classifiedData.length; i++) {
          const item = classifiedData[i]
          // 匹配单词和短语
          if (item.name === value || item.name.slice(0, -7) === value) {
            form.setFieldsValue({ description: item.description })
            setDescCanEdit(false)
            return
          }
        }
        // 没有找到对应的单词本信息，允许描述字段的编辑，视为新增单词本
        form.setFieldsValue({ description: '' })
        setDescCanEdit(true)
      }
    },
    [form],
  )

  const saveFn = (rowData: wordBookRow) => {
    wordBookAPI.addWords(rowData).then((res: responseDataType<string>) => {
      const { code, data, msg } = res
      if (typeof code === 'number' && code === 0) {
        setDefaultWordBookId(rowData.bookName || '')
        Notification.success({
          title: '添加成功',
          content: data,
          showIcon: true,
          position: 'bottomRight',
        })
        // 刷新单词本列表
        setRefreshWordBookAtom(true)
        // 清空表单输入的内容
        formRef?.current?.resetFields()
        // 如果单词本名称或者描述为空则尝试从本地寻找
        if (!form.getFieldValue('bookName') || !form.getFieldValue('description')) {
          setBookSelectState(true)
        }
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
  // defaultWordBookId变化时执行
  useEffect(() => {
    updateWordBookSelectData()
    setDescription(defaultWordBookId)
  }, [defaultWordBookId, setDescription, updateWordBookSelectData])

  // refreshBookSelectState、refreshWordBookDesc变化时执行（函数已经用useCallback包裹了不需要担心useEffect的重复监听问题）
  useEffect(() => {
    if (refreshBookSelectState || refreshWordBookDesc) {
      updateWordBookSelectData()
      setDescription(defaultWordBookId)
      setBookSelectState(false)
      setRefreshWordBookDescState(false)
    }
  }, [
    defaultWordBookId,
    refreshWordBookDesc,
    refreshBookSelectState,
    setDescription,
    updateWordBookSelectData,
    setRefreshWordBookDescState,
  ])

  return (
    <Layout>
      <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
          <Card style={{ width: 600 }} title="单词录入">
            <Form autoComplete="off" colon={true} onSubmit={saveFn} ref={formRef} form={form}>
              <FormItem label="单词本" field="bookName" rules={[{ required: true, message: '请选择一个单词本' }]}>
                <Select allowCreate placeholder="请选择一个单词本（支持手动输入，会自动创建）" allowClear onChange={setDescription}>
                  {bookNameOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem label="描述" field="description" rules={[{ required: true, message: '请输入单词本的描述' }]}>
                <Input placeholder="单词本描述" disabled={!descCanEdit} />
              </FormItem>
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
