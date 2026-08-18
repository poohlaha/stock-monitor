/**
 * @fileOverview 全球市场
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { Tabs } from 'antd'
import { createSparkline, getColor, getRateClassName } from '@pages/utils'
import { useStore } from '@views/stores'
import GroupTemplate from '@views/components/group/one'

const MarketGlobalMarket = (): ReactElement => {
  const { marketStore } = useStore()

  const render = () => {
    return (
      <GroupTemplate title="全球市场" className="mt-4">
        <Tabs
          className="m-ant-tabs wh100"
          items={marketStore.worldwide?.tabs || []}
          activeKey={marketStore.market.tabs.globalActiveTabIndex}
          onChange={async tabIndex => {
            if (tabIndex === marketStore.market.tabs.globalActiveTabIndex) return
            const tab = (marketStore.worldwide?.tabs || []).find((c: Record<any, any> = {}) => c.key === tabIndex) || {}
            marketStore.market.tabs.globalActiveTabIndex = tabIndex
            await marketStore.onGetWorldwideName(tab.market || '')
          }}
        />

        <div className="mt-4 flex-wrap gap-4">
          {(marketStore.worldwide.list || []).map((item: Record<string, any> = {}, index: number) => {
            const ratioClass = getRateClassName(item.ratio || '-')
            let color = getColor(item.ratio || '-')
            return (
              <div
                className="flex-direction-column border rounded-lg p-4 w-64 h-24 bg-line-hover hover:shadow-md"
                key={index}
              >
                <div className="flex-align-center">
                  <div className="flex-1 flex-align-center">
                    <img src={item.logo?.logo || null} className="w-8 h-8 mr-2 rounded-full border" />
                    <div className="flex-direction-column">
                      <p className="font-bold">{item.name || '-'}</p>
                      <div className="flex-align-center text-xs mt-1">
                        <p className="bg-[#00add7] p-0.5 mr-1 text-white rounded">{item.exchange || '-'}</p>
                        <p className="overflow-hidden text-ellipsis whitespace-nowrap">{item.code || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="ml-1 w-16 h-10"
                    style={{
                      backgroundImage: createSparkline(item.p?.split(',') || [], color || ''),
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '100% 100%'
                    }}
                  ></div>
                </div>

                <div className="flex-align-center mt-1">
                  <p className="font-bold text-base flex-1">{item.lastPrice}</p>
                  <div className="flex-align-center ml-1 font-bold">
                    <p className={`mr-2 ${getRateClassName(item.increase || '-')}`}>{item.increase || '-'}</p>
                    <p className={`${ratioClass || ''}`}>{item.ratio || '-'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MarketGlobalMarket)
