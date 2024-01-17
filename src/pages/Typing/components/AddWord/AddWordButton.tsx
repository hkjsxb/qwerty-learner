import { IconAddWord } from '@/pages/Typing/components/AddWord/icon/IconAddWord'
import { recordErrorBookAction } from '@/utils'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const AddWordButton = () => {
  const navigate = useNavigate()

  const addWord = useCallback(() => {
    navigate('/add-word')
    recordErrorBookAction('open')
  }, [navigate])

  return (
    <button
      type="button"
      onClick={addWord}
      className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white`}
      title="向单词本中添加数据"
    >
      <IconAddWord className="icon" />
    </button>
  )
}

export default AddWordButton
