/**
 * @fileOverview 热门指标
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import GroupTemplate from '@views/components/group/one'

const MacroHotIndicator = (): ReactElement => {
  const { marketStore } = useStore()

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const render = () => {
    return (
      <GroupTemplate
        title="热门指标"
        className="mt-4"
        titleSizeClassName="text-lg"
        bodyClassName="flex-direction-column"
      >
        <div className="flex-align-center flex-wrap gap-2.5">
          {(marketStore.hotIndicators.tabs || []).map((h: Record<string, any> = {}, index: number) => {
            const active = activeTabIndex === index
            return (
              <div
                className={`${active ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                key={index}
                onClick={async () => {
                  setActiveTabIndex(index)
                  await marketStore.onGetHotIndicators(h.name || '')
                }}
              >
                <p className="whitespace-nowrap">{h.name || ''}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex-direction-column">
          <div className="flex-align-center text-xs pl-2 pr-2 h-8">
            <div className="flex-2 color-gray">指标名称</div>
            <div className="flex-1 color-gray">最新值</div>
            <div className="flex-1 color-gray">前值</div>
            <div className="flex-1 color-gray">路透调查值</div>
            <div className="flex-1 color-gray">发布时间</div>
          </div>

          <div className="mt-2 flex-direction-column max-h-[400px] overflow-y-auto no-scrollbar">
            {(marketStore.hotIndicators.list || []).map((l: Record<string, any> = {}, index: number) => {
              return (
                <div
                  className="p-2 rounded-lg bg-line-hover change-color cursor-pointer border-top flex-align-center pl-2 pr-2"
                  key={index}
                >
                  <div className="flex-2 flex-align-center pt-2 pb-2">
                    <img src={l.countryIcon || null} className="w-6 h-6 mr-1" />
                    <p className="">
                      {l.country || ''}
                      {l.name || ''}
                    </p>
                  </div>

                  <div className="flex-1">{l.value || '-'}</div>
                  <div className="flex-1">{l.priorValue || '-'}</div>
                  <div className="flex-1">{l.rtrPoll || '-'}</div>
                  <div className="flex-1">{l.time || '-'}</div>
                </div>
              )
            })}
          </div>
        </div>
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MacroHotIndicator)
