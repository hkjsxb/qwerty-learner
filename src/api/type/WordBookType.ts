import type { DictionaryResource } from '@/typings'

export type wordBookRow = {
  name: string
  trans: string
  usphone?: string
  ukphone?: string
  createTime?: string
  id?: number
  userName?: string
  type?: number
  userId?: string
  bookName?: string
  description?: string
}

export type wordBookListType = {
  count: number
  wordBookList: Array<wordBookRow>
}

// {
//     "createTime": "2024-01-21 15:58:01",
//     "name": "lit",
//     "id": 1,
//     "userName": "神奇的程序员",
//     "type": 0,
//     "userId": "c04618bab36146e3a9d3b411e7f9eb8f",
//     "trans": "发光,发亮"
// }

// 接口返回值类型
export type responseDataType<T = any> = {
  msg?: string
  code?: number
  data: T
  fileName?: string
  count?: number // 数据总条数
}

export type TransformedData = {
  单词本: string
  单词?: DictionaryResource[]
  例句?: DictionaryResource[]
}
