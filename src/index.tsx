import Loading from './components/Loading'
import './index.scss'
import { ErrorBook } from './pages/ErrorBook'
import TypingPage from './pages/Typing'
import type { responseDataType, wordBookListType, wordBookRow } from '@/api/type/WordBookType'
import wordBookAPI from '@/api/wordBookAPI'
import { isOpenDarkModeAtom, needLogin } from '@/store'
import type { DictionaryResource } from '@/typings'
import { calcChapterCount } from '@/utils'
import { Notification } from '@arco-design/web-react'
import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai/index'
import mixpanel from 'mixpanel-browser'
import process from 'process'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))
const AddWordPage = lazy(() => import('@/pages/Typing/components/AddWord'))
const LoginPage = lazy(() => import('@/pages/Typing/components/Login'))

if (process.env.NODE_ENV === 'production') {
  // for prod
  mixpanel.init('bdc492847e9340eeebd53cc35f321691')
} else {
  // for dev
  mixpanel.init('5474177127e4767124c123b2d7846e2a', { debug: true })
}

const container = document.getElementById('root')

function Root() {
  const [wordBookLoadState, setWordBookLoadState] = useState(false)
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  const setNeedToLogIn = useSetAtom(needLogin)
  useEffect(() => {
    const mergeData = (data: Array<wordBookRow>, totalWordCount: number, totalPhraseCount: number): DictionaryResource[] => {
      const seen: Record<string, boolean> = {} // 记录已添加的组合
      const result: DictionaryResource[] = []
      data.forEach((item) => {
        const bookNameWithPhrase = item.type === 1 ? item.bookName + ' Phrase' : item.bookName
        const key = `${bookNameWithPhrase} - ${item.description}` // 创建一个独特的键
        if (!seen[key]) {
          const resultItem: DictionaryResource = {
            id: item.type === 1 ? item.bookName + '-Phrase' : item.bookName || '',
            name: bookNameWithPhrase || '',
            description: item.description || '',
            chapterCount: item.type === 1 ? calcChapterCount(totalPhraseCount) : calcChapterCount(totalWordCount),
            category: '英文书籍',
            tags: item.type === 1 ? ['例句'] : ['单词'],
            url: '',
            length: item.type === 1 ? totalPhraseCount : totalWordCount,
            language: 'en',
            languageCategory: 'VocabularyBook',
          }
          result.push(resultItem)
          seen[key] = true
        }
      })
      return result
    }

    // 获取单词本数据，将其放入本地存储中
    wordBookAPI
      .getWordBookList({ pageNo: 1, pageSize: 10000 })
      .then((res: responseDataType<wordBookListType>) => {
        const { data, code, msg } = res
        if (code === 0) {
          const wordBookList = data.wordBookList
          // 计算出单词和例句的总数
          let totalWordCount = 0
          let totalPhraseCount = 0
          for (let i = 0; i < wordBookList.length; i++) {
            const item = wordBookList[i]
            if (item.type === 1) {
              totalPhraseCount++
              continue
            }
            totalWordCount++
          }
          localStorage.setItem('wordBookList', JSON.stringify(wordBookList))
          // 生成分类数据
          const remoteClassifiedData = mergeData(wordBookList, totalWordCount, totalPhraseCount)
          localStorage.setItem('remoteClassifiedData', JSON.stringify(remoteClassifiedData))
          setWordBookLoadState(true)
          return
        }
        Notification.error({
          title: code,
          content: msg,
          showIcon: true,
          position: 'bottomRight',
        })
      })
      .catch(() => {
        setWordBookLoadState(true)
      })
    if (darkMode) {
      document.body.setAttribute('arco-theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.setAttribute('arco-theme', 'light')
    }
    const handleAxiosCatchEvent = (event: CustomEventInit) => {
      // 更新状态
      const { type } = event.detail
      if (type === 'needLogin') {
        setNeedToLogIn(true)
      }
    }
    window.addEventListener('axiosCatchEvent', handleAxiosCatchEvent)
    return () => {
      window.removeEventListener('axiosCatchEvent', handleAxiosCatchEvent)
    }
  }, [darkMode, setNeedToLogIn])

  if (!wordBookLoadState) {
    return <Loading />
  }

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<TypingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/error-book" element={<ErrorBook />} />
            <Route path="/add-word" element={<AddWordPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </React.StrictMode>
  )
}

container && createRoot(container).render(<Root />)
