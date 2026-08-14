/**
 * @fileOverview 7 * 24 快讯
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import GroupTwoTemplate from '@views/components/group/two'
import { Popover, Tabs } from 'antd'
import { formatTimestamp, getRateClassName, getTodayText } from '@pages/utils'
import Utils from '@utils/utils'

const MarketBreakingNews = (): ReactElement => {
  const { marketStore } = useStore()

  const [activeTabIndex, setActiveTabIndex] = useState('0')

  const render = () => {
    let itemList = [
      {
        label: '全部',
        key: '0'
      }
    ]
    const items = (marketStore.breakingNews?.tag || []).map((tab: Record<string, any> = {}, index: number) => {
      return {
        label: tab.text || '',
        key: `${index + 1}`
      }
    })

    itemList = itemList.concat(items)

    const list = marketStore.breakingNews?.list || []
    return (
      <GroupTwoTemplate title="7*24快讯" className="mt-8" bodyClassName="flex-direction-column">
        <Tabs
          className="m-ant-tabs wh100"
          items={itemList}
          activeKey={activeTabIndex}
          onChange={async tabIndex => {
            if (tabIndex === activeTabIndex) return
            setActiveTabIndex(tabIndex)
            const item = items.find((_: Record<any, any> = {}, index: number) => `${index}` === tabIndex) || {}
            await marketStore.onGetBreakingNews(item.label || '')
          }}
        />

        <div className="flex-direction-column">
          <p className="font-bold text-base h-8">{getTodayText()}</p>
          <div className="grid grid-cols-2 gap-5 h-[450px] overflow-y-auto no-scrollbar">
            {(list || []).map((l: Record<any, any>, index: number) => {
              const content = l.content || {}
              const items = content.items || []
              let text = ''
              if (items.length > 0) {
                text = items[0].data || ''
              }

              const entityList = (l.entity || []).slice(0, 3)
              return (
                <div className="p-2 bg-line-hover rounded-md hover:shadow-md flex-direction-column" key={index}>
                  <p className="text-xs">{formatTimestamp(l.publish_time)}</p>
                  {!Utils.isBlank(l.title || '') && (
                    <Popover
                      trigger={['hover']}
                      classNames={{
                        root: 'm-table-sortable-popover'
                      }}
                      placement="top"
                      arrow={false}
                      content={
                        <div className="font-bold">
                          <span className="whitespace-nowrap">【${l.title || ''}】</span>
                          <span className="">{text || ''}</span>
                        </div>
                      }
                    >
                      <div className="font-bold overflow-hidden over-three-ellipsis mt-2">
                        <span className="whitespace-nowrap">【{l.title || ''}】</span>
                        <span className="">{text || ''}</span>
                      </div>
                    </Popover>
                  )}

                  {(entityList || []).length > 0 && (
                    <div className="mt-2 flex-align-center gap-2.5 flex-wrap">
                      {(entityList || []).map((entry: Record<string, any> = {}, i: number) => {
                        return (
                          <div
                            className="tag pt-1 pb-1 pl-2 pr-2 text-xs flex-align-center rounded-md"
                            key={`${index}_${i}`}
                          >
                            <p className="bg-purple-500 p-0.5 mr-2 rounded text-white">{entry.exchange || ''}</p>
                            <p>{entry.name || ''}</p>
                            <p className={`ml-2 ${getRateClassName(entry.ratio || '-')}`}>{entry.ratio || '-'}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </GroupTwoTemplate>
    )
  }

  return render()
}

export default observer(MarketBreakingNews)
