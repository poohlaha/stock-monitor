/**
 * @fileOverview 产业链
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { Tabs } from 'antd'
import { getRateClassName } from '@pages/utils'
import { useStore } from '@views/stores'
import GroupTemplate from '@views/components/group/one'

const MacroIndustrialChain = (): ReactElement => {
  const { marketStore } = useStore()

  const getItem = () => {
    if (marketStore.industrialChainMarket.length === 0) {
      return []
    }

    const arr: Array<any> = []
    for (let m of marketStore.industrialChainMarket) {
      const list = m.secondaryIndustries || []
      arr.push({
        ...m,
        key: m.id || '',
        label: m.name || '',
        value: m.id || '',
        children: (
          <div className="mt-4 flex-wrap gap-4">
            {list.map((l: Record<string, any> = {}) => {
              return (
                <div
                  className="border rounded-lg p-4 w-[400px] h-24 bg-line-hover hover:shadow-md flex-align-center"
                  key={l.id}
                >
                  <div className="flex-2 flex-align-center mr-1">
                    <img src={l.cover || ''} className="w-14 h-14 rounded-lg" />
                    <div className="flex-direction-column flex-jsc-center ml-1">
                      <p className="font-bold">{l.name || '-'}</p>
                      <p className="color-gray mt-1">{l.number || '0'}家公司</p>
                    </div>
                  </div>

                  <div className="flex-direction-column flex-jsc-center">
                    <p className={`font-bold ${getRateClassName(l.chgRatio || '-')}`}>{l.chgRatio || '-'}</p>
                    <p className="mt-1 color-gray">年初至今涨跌幅</p>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })
    }

    return arr
  }

  const render = () => {
    return (
      <GroupTemplate title="产业链" className="mt-8">
        <Tabs
          className="wh100"
          items={getItem()}
          activeKey={marketStore.market.tabs.industrialActiveTabIndex}
          onChange={async tabIndex => {
            if (tabIndex === marketStore.market.tabs.industrialActiveTabIndex) return
            marketStore.market.tabs.industrialActiveTabIndex = tabIndex
          }}
        />
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MacroIndustrialChain)
