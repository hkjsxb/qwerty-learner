import base from '@/api/base'
import type { wordBookRow } from '@/api/type/WordBookType'
import services from '@/config/axios'

// 定义参数类型

const wordBookAPI = {
  getWordBookList(params: { pageNo?: number; pageSize?: number }) {
    return services.get(`${base.lkBaseURL}/wordBook/getWordBookList`, {
      params: params,
    })
  },
  addWords(params: wordBookRow) {
    return services.post(`${base.lkBaseURL}/wordBook/addWords`, params)
  },
  delWords(params: { id: number }) {
    return services.post(`${base.lkBaseURL}/wordBook/delWords`, params)
  },
  // 批量导入
  importWords(file: FormData) {
    return services.post(`${base.lkBaseURL}/wordBook/importWords`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default wordBookAPI
