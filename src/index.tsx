import Loading from './components/Loading'
import './index.scss'
import { ErrorBook } from './pages/ErrorBook'
import TypingPage from './pages/Typing'
import type { responseDataType, wordBookListType } from '@/api/type/WordBookType'
import wordBookAPI from '@/api/wordBookAPI'
import { isOpenDarkModeAtom } from '@/store'
import { Notification } from '@arco-design/web-react'
import { useAtomValue } from 'jotai'
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
  useEffect(() => {
    // 获取单词本数据，将其放入本地存储中
    wordBookAPI.getWordBookList({}).then((res: responseDataType<wordBookListType>) => {
      const { data, code, msg } = res
      if (code === 0) {
        localStorage.setItem('wordBookList', JSON.stringify(data.wordBookList))
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
    if (darkMode) {
      document.body.setAttribute('arco-theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.setAttribute('arco-theme', 'light')
    }
  }, [darkMode])

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
