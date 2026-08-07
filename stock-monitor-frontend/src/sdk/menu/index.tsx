/**
 * @fileOverview Tray Menu
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { exit } from '@tauri-apps/plugin-process'
import useMount from '@hooks/useMount'
import { emitTo, listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { CONSTANT } from '@config/index'
import Utils from '@utils/utils'
import { Button, Tabs, Tag } from 'antd'
import { useStore } from '@views/stores'
import NoData from '@views/components/noData'
import RouterUrls from '@route/router.url.toml'
import { openPath } from '@tauri-apps/plugin-opener'
import Page from '@views/modules/page'
import { TOAST } from '@utils/base'

const TrayMenu = (): ReactElement => {
  const { trayStore, pipelineStore } = useStore()
  const [activeTabIndex, setActiveTabIndex] = useState<string>('1')

  useMount(async () => {
    document.body.style.minWidth = '0'
    let tabHeaderDom = document.querySelector('.ant-tabs-nav-wrap')
    if (tabHeaderDom) {
      tabHeaderDom.setAttribute('class', 'ant-tabs-nav-wrap pl-4 pr-4')
    }

    // 监听主题更改事件
    await listen('chang-theme', async event => {
      console.log('[Tray Menu] 收到主窗口 [change-theme] 事件:', event)
      let payload: any = event.payload || {}
      let skin = payload.skin || ''
      if (Utils.isBlank(skin)) return

      // 更改主题
      document.body.setAttribute('class', '')

      let className = ''
      // 跟随系统
      if (skin === CONSTANT.SKINS[2]) {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        className += isSystemDark ? CONSTANT.SKINS[1] : CONSTANT.SKINS[0]
      } else {
        className += skin
      }

      console.log('class', className)

      document.body.setAttribute('class', className)
    })

    await listen('tauri://blur', async () => {
      let currentWindow = getCurrentWindow()
      let focused = await currentWindow.isFocused()
      if (!focused) {
        setTimeout(async () => {
          console.log('[Tray Menu] blur and hiding self...')
          await currentWindow.hide()
          await currentWindow.setAlwaysOnTop(false)
        }, 100)
      }
    })
  })

  useEffect(() => {
    if (pipelineStore.list.length === 0 && !pipelineStore.loading) {
      pipelineStore.getList()
    }

    if (trayStore.applicationList.length === 0 && !trayStore.loading) {
      trayStore.getApplicationList()
    }
  }, [pipelineStore.list, trayStore.applicationList])

  const onHideTrayMenu = async () => {
    // 隐藏托盘菜单
    const trayWindow = await WebviewWindow.getByLabel('trayMenu')
    await trayWindow?.hide()
  }

  // 显示主窗口
  const onShowMainWindow = async () => {
    await onHideTrayMenu()

    // 显示主窗口
    const mainWindow = await WebviewWindow.getByLabel('main')
    await mainWindow?.show()
    await mainWindow?.unminimize()
    await mainWindow?.setFocus()
  }

  // 退出
  const onQuit = async () => {
    await onHideTrayMenu()
    await exit(0)
  }

  const getPipelineHtml = () => {
    if (pipelineStore.loading) return null
    if (pipelineStore.list.length === 0) {
      return (
        <div className="wh100 flex-center">
          <NoData />
        </div>
      )
    }

    return (
      <div className="wh100 overflow-y-auto p-4">
        {pipelineStore.list.map((item: { [K: string]: any } = {}, index: number) => {
          const basic = item.basic || {}
          let buttonDisabled = pipelineStore.onDisabledRunButton(item.status || '')
          let status =
            pipelineStore.RUN_STATUS.find(
              (status: { [K: string]: any } = {}) => status.value.toLowerCase() === (item.status || '').toLowerCase()
            ) || {}
          return (
            <div
              className={`card p-4 border rounded-md text-xs ${index !== pipelineStore.list.length - 1 ? 'mb-4' : ''}`}
              key={index}
            >
              <p className="card-title font-bold text-base">{basic.name || ''}</p>
              <div className="card-content mt-2">
                {!Utils.isBlank(basic.desc || '') && (
                  <div
                    dangerouslySetInnerHTML={{ __html: basic.desc || '' }}
                    className="color-desc flex-align-center over-three-ellipsis"
                    style={{ whiteSpace: 'pre-line' }}
                  ></div>
                )}

                <div className="flex-align-center h-6 flex-jsc-between mt-2 color-desc">
                  <p>运行状态:</p>
                  <div>
                    <Tag className="m-ant-tag" color={status.color || ''}>
                      {status.label || ''}
                    </Tag>
                  </div>
                </div>

                <div className="flex-align-center h-6 flex-jsc-between mt-2 color-desc">
                  <p>上次运行时间:</p>
                  <div>{item.lastRunTime || '-'}</div>
                </div>
              </div>
              <div className="card-footer mt-2 flex-jsc-between">
                {pipelineStore.getTagHtml(basic.tag || '')}

                <a
                  className={buttonDisabled ? 'disabled' : ''}
                  onClick={async () => {
                    if (buttonDisabled) return
                    // 获取详情
                    await pipelineStore.getDetailInfo(item.id || '', item.serverId || '')
                    await pipelineStore.getHistoryList(item.id || '', item.serverId || '')
                    if (pipelineStore.historyList.length > 0) {
                      pipelineStore.onRerun(pipelineStore.historyList[0] || {}, undefined)
                      await pipelineStore.onRun(true, undefined, false)
                    } else {
                      TOAST.show({ message: '未找到运行记录, 请打开`主界面->流水线`运行', type: 4 })
                    }
                  }}
                >
                  重试
                </a>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const getApplicationHtml = () => {
    if (trayStore.loading) return null
    let applicationList = trayStore.applicationList || []
    if (applicationList.length === 0) {
      return (
        <div className="wh100 flex-center">
          <NoData />
        </div>
      )
    }

    return (
      <div className="wh100 overflow-y-auto pl-4 pr-4">
        {applicationList.map((item: { [K: string]: any } = {}, index: number) => {
          let hasStart = (item.processIds || []).length > 0
          const name = !Utils.isBlank(item.realName || '') ? item.realName || '' : item.name || ''
          return (
            <div
              className={`menu-item  w100 flex-align-center h-8 bg-menu-hover cursor-pointer pl-2 pr-2 relative rounded-md ${index !== applicationList.length - 1 ? 'mt-1' : 'mb-3'} ${index === 0 ? '!mt-3' : ''}`}
              key={index}
            >
              <div className="flex-1 flex-align-center">
                <img className="w-6 h-6 mr-2 select-none" src={item.icon || ''} />
                <p className="select-none">{name || ''}</p>
              </div>

              <Button
                className={`m-ant-button ${hasStart ? '' : 'hidden'}`}
                type="link"
                onClick={async () => {
                  onHideTrayMenu()

                  if (hasStart) {
                    // 结束进程
                    await trayStore.onKillApp(item.processIds)
                    // 更新
                    trayStore.onUpdateProcessList(item.path || '')
                    return
                  }

                  // 使用 openPath 会失去焦点
                  openPath(item.path || '')

                  // 获取进程ID列表
                  setTimeout(async () => {
                    await trayStore.onGetProcessIds(item.name || '', item.path || '')
                  }, 300)
                }}
              >
                <p className={`${hasStart ? 'red' : ''} select-none`}>{hasStart ? '结束' : '启动'}</p>
              </Button>
            </div>
          )
        })}
      </div>
    )
  }

  const tabs = [
    {
      key: '1',
      label: '流水线',
      children: getPipelineHtml()
    },
    {
      key: '2',
      label: '应用程序',
      children: getApplicationHtml()
    }
  ]

  // 设置
  const onSetSetting = async () => {
    console.log('[Tray Menu] 向主窗口发送消息, 更改为设置菜单')
    await emitTo('main', 'set-setting-menu', {
      menu: RouterUrls.SETTING.SYSTEM.KEY
    })
    await onShowMainWindow()
  }

  const render = () => {
    // let applicationList = homeStore.applicationList || []
    return (
      <Page
        className="wh100 flex-direction-column background color relative tray-menu-page"
        contentClassName="!p-0"
        loading={trayStore.loading || pipelineStore.loading}
        title={{
          show: false
        }}
      >
        <div className="wh100 pb-12">
          <Tabs
            className="m-ant-tabs wh100"
            items={tabs}
            activeKey={activeTabIndex}
            onChange={async tabIndex => {
              if (tabIndex === activeTabIndex) return
              setActiveTabIndex(tabIndex)
              if (tabIndex === '1') {
                await pipelineStore.getList()
              } else {
                await trayStore.getApplicationList()
              }
            }}
          />
        </div>

        <div className="h-12 w100 flex-align-center fixed bottom-0 background pl-2 pr-2">
          <div
            className="svg-box w-8 h-8 p-2 bg-menu-hover cursor-pointer rounded-md"
            onClick={async () => await onSetSetting()}
          >
            <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M512 671.72c-88.05 0-159.7-71.64-159.7-159.69 0-88.06 71.65-159.7 159.7-159.7s159.68 71.64 159.68 159.7c0 88.05-71.63 159.69-159.68 159.69z m0-265.67c-58.44 0-105.98 47.54-105.98 105.98C406.02 570.46 453.56 618 512 618c58.43 0 105.97-47.54 105.97-105.97 0-58.44-47.54-105.98-105.97-105.98z"
                fill="currentColor"
              ></path>
              <path
                d="M650.46 926.48c-20.51 0-40.5-10.64-51.48-29.65-17.46-30.22-49.94-48.97-84.83-48.97h-0.12l-3.82-0.01c-0.31-0.01-0.63-0.01-0.96-0.01-34.6 0-66.32 17.89-83.04 46.88-8.25 14.29-21.57 24.51-37.52 28.77-15.96 4.29-32.59 2.09-46.87-6.16L244.3 861c-13.81-7.97-23.69-20.84-27.81-36.24-4.12-15.4-2.01-31.48 5.97-45.29 17.72-30.69 17.74-68.84 0.06-99.55l-0.69-1.2c-17.62-30.61-50.5-49.62-85.8-49.62-33.12 0-60.07-26.95-60.07-60.07V457.81c0-34.63 28.17-62.8 62.8-62.8 33.66 0 65-18.12 81.79-47.28 18.92-32.85 18.9-73.65-0.05-106.48l-3.06-5.29c-13.7-23.74-5.54-54.16 18.16-67.84l105.79-61.08c29.77-17.17 67.93-6.93 85.1 22.8 16.6 28.78 48.07 46.54 82.26 46.54 0.35 0 0.71 0 1.05-0.01l3.53-0.02h0.12c35.57 0 68.03-18.73 85.44-48.91 8.08-14 20.84-23.79 36.12-27.88 15.24-4.12 31.2-2 44.89 5.91l100.25 57.89c13.69 7.89 23.48 20.65 27.57 35.92 4.09 15.26 1.99 31.21-5.9 44.89-17.22 29.82-16.58 67.77 1.68 99.04l1.08 1.87c17.7 30.73 50.03 49.91 84.31 49.91 32.63 0 59.17 26.54 59.17 59.17v115.87c0 32.56-26.49 59.05-59.06 59.05-34.31 0-66.69 19.21-84.48 50.13l-0.98 1.69c-18.26 31.29-18.89 69.27-1.65 99.11 16.26 28.2 6.57 64.37-21.61 80.65l-100.22 57.86c-9.35 5.4-19.54 7.96-29.6 7.96zM514.2 794.14c53.98 0 104.29 29.04 131.3 75.83 0.96 1.67 2.39 2.33 3.41 2.61 1.04 0.3 2.58 0.39 4.26-0.55l100.22-57.86c2.54-1.47 3.41-4.73 1.94-7.28-26.85-46.49-26.16-105.13 1.78-153.04l24.1 11.99-23.28-13.4c27.36-47.53 77.57-77.06 131.04-77.06 2.94 0 5.34-2.39 5.34-5.33V454.18c0-3-2.45-5.45-5.46-5.45-53.43 0-103.61-29.49-130.95-76.96l-0.84-1.46c-27.95-47.89-28.64-106.5-1.81-152.98 0.93-1.61 0.81-3.14 0.55-4.14-0.26-0.99-0.92-2.37-2.53-3.3L653.04 152a5.369 5.369 0 0 0-4.13-0.54c-1 0.26-2.37 0.92-3.3 2.53-27.17 47.07-77.46 76.09-131.44 76.09H514l-3.58 0.02c-54.11 0.52-103.99-27.55-130.45-73.4-1.53-2.68-3.92-3.65-5.21-3.99-1.3-0.34-3.84-0.68-6.5 0.85L266 212.6l1.01 1.76c28.52 49.4 28.55 110.76 0.09 160.17-26.35 45.76-75.53 74.19-128.34 74.19-5.01 0-9.08 4.07-9.08 9.08v111.22c0 3.5 2.85 6.35 6.35 6.35 54.47 0 105.18 29.32 132.35 76.53l0.69 1.19c27.21 47.28 27.18 105.99-0.09 153.22-1.02 1.78-0.89 3.44-0.6 4.54 0.29 1.08 1.01 2.6 2.77 3.61l97.55 56.31c3.84 2.22 8.79 0.92 11-2.94 26.31-45.58 75.84-73.74 129.51-73.74 0.5 0 0.97 0 1.46 0.01l3.36 0.01c0.04 0.03 0.11 0.03 0.17 0.03z"
                fill="currentColor"
              ></path>
            </svg>
          </div>

          <div className="flex-1 flex-center">
            <Button className="m-ant-button" onClick={async () => await onShowMainWindow()}>
              打开主界面
            </Button>
          </div>

          <Button className="m-ant-button" type="link" onClick={async () => await onQuit()}>
            退出
          </Button>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(TrayMenu)
