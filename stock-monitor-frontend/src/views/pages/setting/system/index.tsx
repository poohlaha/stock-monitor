/**
 * @fileOverview SQL
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import RouterUrls from '@route/router.url.toml'
import Page from '@views/modules/page'
import { useStore } from '@views/stores'
import { Select, Switch, Radio, Input, Button } from 'antd'
import { CONSTANT } from '@config/index'
import { emitTo } from '@tauri-apps/api/event'

const System = (): ReactElement => {
  const { systemStore, commonStore } = useStore()
  const [updateNodeJsDir, setUpdateNodeJsDir] = useState(false)
  const [nodeJsDir, setNodeJsDir] = useState('')

  const render = () => {
    return (
      <Page
        className="system-page wh100 overflow background-right color"
        loading={systemStore.loading}
        contentClassName="content-box wh100 flex-direction-column"
        title={{
          label: RouterUrls.SETTING.SYSTEM.NAME
        }}
      >
        <div className="page-wrapper flex-1 flex-direction-column pt-5">
          <div className="flex-direction-column bg-card p-4 rounded-md">
            <p className="font-bold">主题与字体</p>
            <div className="p-4 mt-2 rounded-md">
              <div className="flex-align-center flex-jsc-between mb-2 h-10">
                <p>主题切换</p>
                <div className="flex-align-center border pl-2 pr-2 pt-1 pb-1 rounded-full">
                  <div
                    className={`bg-menu-hover mr-2 cursor-pointer pl-3 pr-3 pt-1 pb-1 rounded-full ${commonStore.skin === CONSTANT.SKINS[2] ? 'theme-bg' : ''}`}
                    onClick={async () => {
                      commonStore.onSkinChange(2)
                      await systemStore.onSave(commonStore.skin)
                      // 向托盘窗口发送请求
                      await emitTo('trayMenu', 'chang-theme', {
                        skin: commonStore.skin || ''
                      })
                    }}
                  >
                    跟随系统
                  </div>
                  <div
                    className={`bg-menu-hover mr-2 cursor-pointer pl-3 pr-3 pt-1 pb-1 rounded-full border-0 ${commonStore.skin === CONSTANT.SKINS[0] ? 'theme-bg' : ''}`}
                    onClick={async () => {
                      commonStore.onSkinChange(0)
                      await systemStore.onSave(commonStore.skin)
                      // 向托盘窗口发送请求
                      await emitTo('trayMenu', 'chang-theme', {
                        skin: commonStore.skin || ''
                      })
                    }}
                  >
                    浅色
                  </div>
                  <div
                    className={`bg-menu-hover cursor-pointer pl-3 pr-3 pt-1 pb-1 rounded-full border-0 ${commonStore.skin === CONSTANT.SKINS[1] ? 'theme-bg' : ''}`}
                    onClick={async () => {
                      commonStore.onSkinChange(1)
                      await systemStore.onSave(commonStore.skin)

                      // 向托盘窗口发送请求
                      await emitTo('trayMenu', 'chang-theme', {
                        skin: commonStore.skin || ''
                      })
                    }}
                  >
                    深色
                  </div>
                </div>
              </div>

              <div className="flex-align-center flex-jsc-between mb-2 border-bottom h-10 pb-2">
                <p>字体设置</p>
                <div className="flex-align-center pl-2 pr-2 pt-1 pb-1">
                  <Select
                    className="m-ant-select"
                    rootClassName="m-ant-select-dropdown"
                    style={{ width: 280 }}
                    value={systemStore.font.fontFamily}
                    options={systemStore.FONT_FAMILY_LIST || []}
                    onChange={async (value: string = '') => {
                      systemStore.font.fontFamily = value || ''
                      await systemStore.onSave(commonStore.skin)
                    }}
                  />
                </div>
              </div>

              <div className="flex-align-center flex-jsc-between mb-2 h-10">
                <p>标题类字体大小</p>
                <div className="flex-align-center pl-2 pr-2 pt-1 pb-1">
                  <Select
                    className="m-ant-select"
                    rootClassName="font-select m-ant-select-dropdown"
                    style={{ width: 280 }}
                    value={systemStore.font.titleFontSize}
                    options={systemStore.FONT_LIST || []}
                    optionRender={option => {
                      return (
                        <div className="flex-direction-column border-bottom p-2">
                          <p className="mb-2">{option.value || ''}</p>
                          <div className={`${option.value || ''}`}>我是字体</div>
                        </div>
                      )
                    }}
                    onChange={async (value: string = '') => {
                      systemStore.font.titleFontSize = value || ''
                      await systemStore.onSave(commonStore.skin)
                    }}
                  />
                </div>
              </div>

              <div className="flex-align-center flex-jsc-between mb-2 h-10">
                <p>字体大小</p>
                <div className="flex-align-center pl-2 pr-2 pt-1 pb-1">
                  <Select
                    className="m-ant-select"
                    rootClassName="font-select m-ant-select-dropdown"
                    style={{ width: 280 }}
                    value={systemStore.font.fontSize}
                    options={systemStore.FONT_LIST || []}
                    optionRender={option => {
                      return (
                        <div className="flex-direction-column border-bottom p-2">
                          <p className="mb-2">{option.value || ''}</p>
                          <div className={`${option.value || ''}`}>我是字体</div>
                        </div>
                      )
                    }}
                    onChange={async (value: string = '') => {
                      systemStore.font.fontSize = value || ''
                      await systemStore.onSave(commonStore.skin)
                    }}
                  />
                </div>
              </div>

              <div className="flex-align-center flex-jsc-between h-10">
                <p>描述类字体大小</p>
                <div className="flex-align-center pl-2 pr-2 pt-1 pb-1">
                  <Select
                    className="m-ant-select"
                    rootClassName="font-select m-ant-select-dropdown"
                    style={{ width: 280 }}
                    value={systemStore.font.descFontSize}
                    options={systemStore.FONT_LIST || []}
                    optionRender={option => {
                      return (
                        <div className="flex-direction-column border-bottom p-2">
                          <p className="mb-2">{option.value || ''}</p>
                          <div className={`${option.value || ''}`}>我是字体</div>
                        </div>
                      )
                    }}
                    onChange={async (value: string = '') => {
                      systemStore.font.descFontSize = value || ''
                      await systemStore.onSave(commonStore.skin)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-direction-column mt-5 bg-card p-4 rounded-md">
            <p className="font-bold">系统</p>
            <div className="p-4 mt-2 rounded-md">
              <div className="flex-align-center flex-jsc-between mb-2 h-10">
                <p>开机启动</p>
                <div className="flex-align-center pl-2 pr-2 pt-1 pb-1 rounded-full">
                  <Switch
                    className="m-ant-switch"
                    onChange={async () => await systemStore.onAutoStart(commonStore.skin)}
                    value={systemStore.system.autoStart}
                  />
                </div>
              </div>

              <div className="flex-align-center flex-jsc-between h-10">
                <p>关闭主面板</p>
                <div className="flex-align-center pl-2 pr-2 pt-1 pb-1 rounded-full">
                  <Radio.Group
                    className="m-ant-radio-group"
                    options={[
                      {
                        label: '最小化到程序坞(Dock 栏), 不退出程序',
                        value: '0'
                      },
                      {
                        label: '直接退出程序',
                        value: '1'
                      }
                    ]}
                    onChange={async event => {
                      await systemStore.onClose(event.target.value || '0')
                    }}
                    value={systemStore.system.closeType}
                  />
                </div>
              </div>

              <div className="flex-direction-column h-16">
                <div className="flex-jsc-between flex-align-center">
                  <p>NodeJS目录</p>
                  <div className="flex-align-center pl-2 pr-2 pt-1 pb-1 rounded-full">
                    {updateNodeJsDir ? (
                      <div className="flex-align-center">
                        <Input
                          className="m-ant-input"
                          placeholder="请输入"
                          maxLength={300}
                          style={{ width: 280 }}
                          value={nodeJsDir}
                          allowClear
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setNodeJsDir(e.target.value)
                          }}
                        />
                        <div className="ml-2">
                          <Button
                            type="primary"
                            size="small"
                            className="mr-2"
                            onClick={async () => {
                              await systemStore.onGetNodeJsDir(nodeJsDir || '')
                              setNodeJsDir(systemStore.system.nodeJsDir || '')
                              setUpdateNodeJsDir(false)
                            }}
                          >
                            确定
                          </Button>
                          <Button
                            type="default"
                            size="small"
                            onClick={() => {
                              setNodeJsDir(systemStore.system.nodeJsDir || '')
                              setUpdateNodeJsDir(false)
                            }}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-align-center">
                        <p>{systemStore.system.nodeJsDir || ''}</p>
                        <div
                          className="svg-box w-6 h-6 theme ml-2 cursor-pointer"
                          onClick={() => {
                            setNodeJsDir(systemStore.system.nodeJsDir || '')
                            setUpdateNodeJsDir(true)
                          }}
                        >
                          <svg
                            className="wh100"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M684.202667 117.248c15.893333-15.872 42.154667-15.36 58.922666 1.408l90.517334 90.517333c16.661333 16.661333 17.344 42.986667 1.429333 58.922667l-445.653333 445.653333c-7.936 7.914667-23.104 16.746667-34.218667 19.776l-143.701333 39.253334c-21.909333 5.994667-35.114667-7.104-29.568-28.949334l37.248-146.773333c2.773333-10.944 11.562667-26.346667 19.392-34.176l445.653333-445.653333zM268.736 593.066667c-2.901333 2.901333-8.106667 12.074667-9.130667 16.021333l-29.12 114.773333 111.957334-30.570666c4.437333-1.216 13.632-6.549333 16.810666-9.728l445.653334-445.653334-90.517334-90.496-445.653333 445.653334zM682.794667 178.986667l90.517333 90.517333-30.186667 30.186667-90.496-90.517334 30.165334-30.165333z m-362.026667 362.048l90.496 90.517333-30.165333 30.165333-90.517334-90.496 30.165334-30.186666zM170.666667 874.666667c0-11.776 9.429333-21.333333 21.461333-21.333334h661.077333a21.333333 21.333333 0 1 1 0 42.666667H192.128A21.333333 21.333333 0 0 1 170.666667 874.666667z"
                              fill="currentColor"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`color-desc ${systemStore.font.descFontSize || ''} flex flex-align-center`}>
                  通过 <p className="ml-1 mr-1 color">which node</p> 查看本地 NodeJS 安装目录
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(System)
