import { IconManage } from '@/pages/Typing/components/VocabularyManage/icon/IconManage'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const ManageButton = () => {
  const navigate = useNavigate()

  const openManagePage = useCallback(() => {
    navigate('/mange-word')
  }, [navigate])
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white`}
      title="管理单词/短语"
      onClick={openManagePage}
    >
      <IconManage className="icon" />
    </button>
  )
}

export default ManageButton
