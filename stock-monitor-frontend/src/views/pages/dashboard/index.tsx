/**
 * @fileOverview dashboard
 * @date 2023-07-05
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@stores/index'
import Page from '@views/modules/page'
import useMount from '@hooks/useMount'
import RouterUrls from '@route/router.url.toml'
import { useNavigate } from 'react-router'
import { Button, Input, Modal, Tabs } from 'antd'
import Utils from '@utils/utils'
import { TOAST } from '@utils/base'

const Dashboard = (): ReactElement => {
  const { marketStore, homeStore } = useStore()

  const [activeGroupTabIndex, setActiveGroupTabIndex] = useState('')
  const [addGroupOpen, setAddGroupOpen] = useState(false)

  const navigate = useNavigate()

  useMount(async () => {
    await marketStore.onGetWatchGroupList(async (groupId: string = '') => {
      setActiveGroupTabIndex(groupId)
      await marketStore.onGetWatchListByGroupId(groupId)
    })
  })

  const render = () => {
    return (
      <Page
        className="dashboard-page"
        contentClassName="flex-direction-column"
        title={{
          show: false
        }}
      >
        <div className="dashboard-content">
          {/* 我的自选 */}
          <div className="flex-direction-column">
            <div className="flex-jsc-between">
              <p className="font-bold text-lg">自选列表</p>
              <Button type="link" onClick={() => setAddGroupOpen(true)}>
                添加分组
              </Button>
            </div>

            <div className="mt-4">
              <Tabs
                items={marketStore.watchGroupList}
                activeKey={activeGroupTabIndex}
                onChange={async tabIndex => {
                  if (tabIndex === activeGroupTabIndex) return
                  setActiveGroupTabIndex(tabIndex)
                  await marketStore.onGetWatchListByGroupId(tabIndex)
                }}
              />
            </div>

            <div className="mt-4 flex-wrap gap-5">
              {(marketStore.groupWatchList || []).map((w: Record<string, any> = {}) => {
                return (
                  <div
                    className="border rounded-lg flex-direction-column w-[300px] p-4 bg-line-hover hover:shadow-md select-none"
                    key={w.id || ''}
                    onClick={() => {
                      const type = w.type || '' // 类型: etf | fund | stock
                      const market = w.market || '' // 市场: ab | hk | us | sg
                      const exchange = w.exchange || ''
                      homeStore.selectedMenu = `${RouterUrls.MARKET.KEY || ''}-${homeStore.MENU_LIST[2].key || ''}`
                      navigate(
                        `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.DETAIL.URL}/${w.code || ''}?code=${w.code || ''}&type=${type || ''}&market=${market || ''}&exchange=${exchange || ''}`
                      )
                    }}
                  >
                    <div className="flex">
                      <p className="font-bold">{w.name || ''}</p>
                      <p className="ml-1 red rounded-md text-xs pt-0.5 pb-0.5 pl-1 pr-1">
                        {(w.type || '').toUpperCase()}
                      </p>
                    </div>
                    <div className="flex-align-center mt-1">
                      <p className="exchange-tag rounded-md text-xs pt-0.5 pb-0.5 pl-1 pr-1">{w.exchange || ''}</p>
                      <p className="color-gray ml-1 text-xs">{w.code || ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Modal
            title="添加/修改分组"
            open={addGroupOpen}
            mask={{
              closable: false
            }}
            onOk={async () => {
              if (Utils.isBlank(marketStore.addGroupForm.name || '')) {
                TOAST.show({ message: '请输入分组名称', type: 4 })
                return
              }

              await marketStore.onAddGroup(() => {
                setAddGroupOpen(false)
              })
            }}
            onCancel={() => {
              marketStore.addGroupForm = Utils.deepCopy(marketStore.ADD_GROUP_FORM_DEFAULT)
              setAddGroupOpen(false)
            }}
          >
            <div className="modal-body flex-direction-column">
              <div className="form-item mt-4 flex-align-center">
                <div className="label mr-4 flex-align-center">
                  <p className="whitespace-nowrap">名称</p>
                  <span className="flex-center red ml-0.5">*</span>
                </div>

                <Input
                  className="m-ant-input"
                  placeholder="请输入"
                  maxLength={20}
                  value={marketStore.addGroupForm.name || ''}
                  allowClear
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const { value } = e.target
                    marketStore.addGroupForm.name = value || ''
                  }}
                />
              </div>
            </div>
          </Modal>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(Dashboard)
