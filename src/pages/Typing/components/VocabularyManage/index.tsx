import type { responseDataType, wordBookRow } from '@/api/type/WordBookType'
import wordBookAPI from '@/api/wordBookAPI'
import Layout from '@/components/Layout'
import BubbleConfirmTemplate from '@/pages/Typing/components/VocabularyManage/BubbleConfirmTemplate'
import { refreshWordBookAtom, wordBookListAtom, wordBookListCountAtom } from '@/store'
import type { PaginationProps } from '@arco-design/web-react'
import { Message } from '@arco-design/web-react'
import { Notification } from '@arco-design/web-react'
import { Card } from '@arco-design/web-react'
import { Button, Input, Popconfirm, Table, Upload } from '@arco-design/web-react'
import type { RefInputType } from '@arco-design/web-react/es/Input'
import type { ColumnProps } from '@arco-design/web-react/es/Table'
import { IconImport, IconSearch } from '@arco-design/web-react/icon'
import { useAtomValue, useSetAtom } from 'jotai'
import type { Ref } from 'react'
import { useEffect } from 'react'
import { useRef, useState } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const VocabularyManage = () => {
  const navigate = useNavigate()
  const setRefreshWordBookAtom = useSetAtom(refreshWordBookAtom)
  const wordBookList = useAtomValue(wordBookListAtom)
  const wordBookListCount = useAtomValue(wordBookListCountAtom)
  const [loading, setLoading] = useState(false)
  const inputRef: Ref<RefInputType> | undefined = useRef(null)
  const filterRef: Ref<HTMLDivElement> = useRef(null)
  const [tableHeight, setTableHeight] = useState(0)
  const uploadRef: Ref<HTMLInputElement> = useRef(null)
  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])
  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: wordBookListCount,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true,
  })

  const [data, setData] = useState(wordBookList)
  const columns: Array<ColumnProps> = [
    {
      title: '单词或短语',
      dataIndex: 'name',
      filterIcon: <IconSearch />,
      filterDropdown: ({ filterKeys, setFilterKeys }) => {
        return (
          <div className="arco-table-custom-filter" ref={filterRef}>
            <Input.Search
              ref={inputRef}
              searchButton
              placeholder=""
              value={(filterKeys && filterKeys[0]) || ''}
              onChange={(value) => {
                setFilterKeys && setFilterKeys(value ? [value] : [])
              }}
              onSearch={(value) => {
                const filterData = wordBookList.filter((item) => {
                  // 不区分大小写
                  return item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
                })
                setData(filterData)
                setPagination((pagination) => ({ ...pagination, current: 1, total: filterData.length }))
                // 获取筛选栏的搜索图标dom，通过点击事件来关闭展开的搜索框（因为自定义了搜索逻辑，不能通过confirm回调来关闭了）
                const arcoTableSearchPanels = document.getElementsByClassName('arco-table-filters')
                if (arcoTableSearchPanels.length > 0) {
                  const searchPanel = arcoTableSearchPanels[0] as HTMLDivElement
                  searchPanel.click()
                }
              }}
            />
          </div>
        )
      },
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => inputRef?.current?.focus(), 150)
        }
      },
    },
    {
      title: '中文释义',
      dataIndex: 'trans',
    },
    {
      title: '美音音标',
      dataIndex: 'usphone',
    },
    {
      title: '美音音标',
      dataIndex: 'ukphone',
    },
    {
      title: '单词本名称',
      dataIndex: 'bookName',
    },
    {
      title: '创建人',
      dataIndex: 'userName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '操作',
      dataIndex: 'op',
      render: (_: Record<string, string>, record: wordBookRow) => (
        <Button onClick={() => removeRow(record.id)} type="primary" status="danger">
          删除
        </Button>
      ),
    },
  ]

  const onChangeTable = (pagination: PaginationProps) => {
    const { current, pageSize } = pagination
    setLoading(true)
    if (current && pageSize) {
      setTimeout(() => {
        setData(wordBookList.slice((current - 1) * pageSize, current * pageSize))
        setPagination((pagination) => ({ ...pagination, current, pageSize }))
        setLoading(false)
      }, 300)
    }
  }

  const removeRow = (id?: number) => {
    if (id == null) {
      Notification.error({
        title: '删除失败',
        content: '单词id不存在',
        showIcon: true,
        position: 'bottomRight',
      })
      return
    }
    // 调用删除接口
    wordBookAPI.delWords({ id }).then((res: responseDataType<string>) => {
      if (res.code === 0) {
        // 刷新单词本数据
        setRefreshWordBookAtom(true)
        // 删除成功
        Notification.success({
          title: '删除成功',
          content: `id=${id}的单词已删除`,
          showIcon: true,
          position: 'bottomRight',
        })
        return
      }
      // 删除失败
      Notification.error({
        title: '删除失败',
        content: res.msg,
        showIcon: true,
        position: 'bottomRight',
      })
    })
  }

  // wordBookList或者wordBookListCount改变时刷新表格数据
  useEffect(() => {
    setData(wordBookList)
    let current = pagination.current
    const maxPage = Math.ceil(wordBookListCount / pagination.pageSize)
    // 如果当前页数大于最大页数则修改current
    if (current > maxPage) {
      current = maxPage
    }
    setTableHeight(window.innerHeight - 150)
    setPagination((pagination) => ({ ...pagination, current, total: wordBookListCount }))
  }, [wordBookList, wordBookListCount])

  // 处理批量导入
  useEffect(() => {
    const handleChange = () => {
      const file = uploadRef.current?.files?.[0]
      if (file == null) {
        return
      }
      const maxSize = 3 * 1024 * 1024
      if (file.size > maxSize) {
        Message.error('文件必须小于3MB')
        return
      }
      if (file.type !== 'application/json') {
        Message.error('文件格式必须为JSON')
        return
      }

      // 构造form对象
      const formData = new FormData()
      // 后台取值字段 | blob文件数据 | 文件名称
      formData.append('file', file, file.name)
      // 调用上传api
      wordBookAPI.importWords(formData).then((res: responseDataType) => {
        if (res.code === 0) {
          // 刷新单词本数据
          setRefreshWordBookAtom(true)
          // 导入成功
          Notification.success({
            title: '导入成功',
            content: '批量导入成功',
            showIcon: true,
            position: 'bottomRight',
          })
          return
        }
        // 导入失败
        Notification.error({
          title: '导入失败',
          content: res.msg,
          showIcon: true,
          position: 'bottomRight',
        })
      })
    }
    // 绑定事件处理函数
    const fileInput = uploadRef.current
    if (!fileInput) return
    fileInput.addEventListener('change', handleChange)
    // 清理函数：组件卸载时移除事件监听
    return () => {
      fileInput.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <Layout>
      <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center">
          <Card
            style={{ width: '85%', overflowY: 'auto' }}
            title="单词管理"
            extra={
              <Popconfirm
                focusLock
                title="导入确认"
                content={BubbleConfirmTemplate}
                onOk={() => {
                  console.log('执行上传动作')
                  uploadRef.current?.click()
                }}
                onCancel={() => {
                  console.log('取消')
                }}
              >
                <div className="trigger" style={{ display: 'none' }}></div>
                <Button type="text" icon={<IconImport />}>
                  批量导入
                </Button>
              </Popconfirm>
            }
            className={' overflow-y-auto'}
          >
            <Table
              loading={loading}
              columns={columns}
              data={data}
              pagination={pagination}
              onChange={onChangeTable}
              scroll={{ y: tableHeight - 100 }}
            />
            <input type="file" ref={uploadRef} style={{ display: 'none' }} />
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default VocabularyManage
