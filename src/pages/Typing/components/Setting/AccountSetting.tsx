import authLoginAPI from '@/api/authLoginAPI'
import base from '@/api/base'
import type { responseDataType } from '@/api/type/WordBookType'
import styles from '@/pages/Typing/components/Setting/index.module.css'
import { needLogin, userInfoAtom } from '@/store'
import { Avatar, Button, Grid, Input, Message, Modal, Notification, Upload } from '@arco-design/web-react'
import type { RefInputType } from '@arco-design/web-react/es/Input'
import type { UploadItem } from '@arco-design/web-react/es/Upload'
import { IconCamera, IconLock, IconUser } from '@arco-design/web-react/icon'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtom, useSetAtom } from 'jotai/index'
import { type KeyboardEventHandler, useEffect, useRef, useState } from 'react'

export default function AccountSetting() {
  const Row = Grid.Row
  const setNeedToLogIn = useSetAtom(needLogin)
  const [userInfo, setUserInfo] = useAtom(userInfoAtom)
  const [userName, setUserName] = useState('')
  const [password, setPassWord] = useState('')
  const userNameRef = useRef<RefInputType | null>(null)

  const signOutFn = () => {
    // 清除token
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setNeedToLogIn(true)
  }

  const updateUserInfoFn = () => {
    if (userName === userInfo.username) {
      return
    }
    if (userName.trim().length > 0) {
      Modal.confirm({
        title: '更新用户名',
        content: `新的用户名为 ${userName} 确定要更改吗？`,
        okButtonProps: {
          status: 'danger',
        },
        onOk: () => {
          authLoginAPI.updateUserInfo({ userId: userInfo.userID, userName: userName }).then((data: responseDataType) => {
            if (data.code === 0) {
              Message.success('用户名更新成功')
              setUserInfo({ ...userInfo, username: userName })
              return
            }
            Message.error(data.msg || '用户名更新失败')
          })
        },
      })
      return
    }
    Message.error('用户名不能为空')
  }

  const handleEnterFn: KeyboardEventHandler = (event) => {
    if (event.key === 'Enter') {
      // 让input失去焦点
      userNameRef.current?.blur()
    }
  }

  const updatePassWordFn = () => {
    if (password.trim().length > 0) {
      Modal.confirm({
        title: '设置新密码',
        content: `密码设置成功后，系统会退出登录，确定吗？`,
        okButtonProps: {
          status: 'danger',
        },
        onOk: () => {
          authLoginAPI.modifyPassword({ password: password }).then((data: responseDataType) => {
            if (data.code === 0) {
              Notification.success({
                title: '密码修改成功',
                content: '请重新登录',
                showIcon: true,
                position: 'bottomRight',
              })
              setTimeout(() => {
                signOutFn()
              }, 500)
              return
            }
            Message.error(data.msg || '密码修改失败')
          })
        },
      })
      return
    }
    Message.error('新密码不能为空')
  }

  const uploadFn = (fileList: UploadItem[], file: UploadItem) => {
    const { status, response: res } = file

    // 文件上传成功
    if (status === 'done') {
      const imgSrc = `${base.lkBaseURL}/uploads/${(res as { fileName: string }).fileName}`
      authLoginAPI.updateUserInfo({ userId: userInfo.userID, avatarSrc: imgSrc }).then((data: responseDataType) => {
        if (data.code === 0) {
          Message.success('头像更新成功')
          setUserInfo({ ...userInfo, avatarSrc: imgSrc })
          return
        }
        Message.error(data.msg || '头像更新失败')
      })
    }
  }

  useEffect(() => {
    if (userInfo.username !== '') {
      setUserName(userInfo.username)
    }
  }, [userInfo])

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <Row className="w-full" justify="center">
            <Upload
              action={`${base.lkBaseURL}/uploadFile/singleFileUpload`}
              showUploadList={false}
              beforeUpload={(file) => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
                return new Promise((resolve, reject) => {
                  if (!isJpgOrPng) {
                    Message.error('只能上传 JPG/PNG 文件!')
                    reject()
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2
                  // 只允许上传2mb以内的jpg/jpeg/png格式的图片
                  if (!isLt2M) {
                    Message.error('图片必须小于 2MB!')
                    reject()
                  }
                  resolve(file)
                })
              }}
              onChange={uploadFn}
            >
              <Avatar size={84} triggerIcon={<IconCamera />} triggerType="mask">
                <img alt="avatar" src={userInfo.avatarSrc} />
              </Avatar>
            </Upload>
          </Row>
          <Row className="w-full">
            <Input
              value={userName}
              onChange={(value) => {
                setUserName(value)
              }}
              ref={userNameRef}
              onBlur={updateUserInfoFn}
              onKeyDown={handleEnterFn}
              height={40}
              showWordLimit
              style={{ width: '100%' }}
              prefix={<IconUser />}
              placeholder="修改用户名"
              maxLength={10}
            />
          </Row>
          <Row className="w-full">
            <Input.Password
              value={password}
              onChange={(value) => {
                setPassWord(value)
              }}
              onBlur={updatePassWordFn}
              height={40}
              style={{ width: '100%' }}
              prefix={<IconLock />}
              placeholder="填写新的密码"
            />
          </Row>
          <Row className="w-full">
            <Button type="primary" status="danger" long onClick={signOutFn}>
              退出登录
            </Button>
          </Row>
        </div>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  )
}
