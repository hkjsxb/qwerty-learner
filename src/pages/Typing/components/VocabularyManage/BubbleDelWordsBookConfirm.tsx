import type { DictionaryResource } from '@/typings'
import { Select } from '@arco-design/web-react'
import { useCallback, useEffect, useState } from 'react'

const BubbleDelWordsBookConfirm = ({ onSelect }: { onSelect: (value: string) => void }) => {
  const Option = Select.Option
  const [bookNameOptions, setBookNameOptions] = useState<Array<string>>([])

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
    }
  }, [])

  useEffect(() => {
    updateWordBookSelectData()
  }, [])

  const setDescription = useCallback(
    (value: string) => {
      onSelect(value) // 调用父组件的回调函数，将值传递回去
    },
    [onSelect],
  )

  return (
    <div>
      <div style={{ width: '300px' }}>
        请选择要删除的单词本数据
        <br />
        <Select placeholder="点此选择" onChange={setDescription}>
          {bookNameOptions.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default BubbleDelWordsBookConfirm
