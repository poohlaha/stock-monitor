/**
 * @fileOverview 经济指标热图
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import GroupTemplate from '@views/components/group/one'

const MacroEconomicMap = (): ReactElement => {
  const { marketStore } = useStore()

  const render = () => {
    return (
      <GroupTemplate
        title="经济指标热图"
        className="mt-4"
        bodyClassName="border rounded-lg"
        titleSizeClassName="text-lg"
      >
        <div className="colums flex-align-center">
          <div className="flex-1 h-12"></div>
          {(marketStore.economicIndicators?.columns || []).map((c: Record<string, any> = {}, index: number) => {
            return (
              <div className="flex-1 h-14 border-left flex-center" key={index}>
                <p className="text-base font-bold">{c.metricName || '-'}</p>
              </div>
            )
          })}
        </div>

        <div className="rows flex-direction-column max-h-[400px] overflow-y-auto no-scrollbar">
          {(marketStore.economicIndicators?.rows || []).map((r: Record<string, any> = {}, index: number) => {
            const cells = r.cells || []
            return (
              <div className="flex-align-center border-top" key={index}>
                <div className="flex-1 h-14 border-left flex-center">
                  <img src={r.countryIcon || ''} className="rounded-full w-6 h-6 mr-1" />
                  <p className="text-base font-bold">{r.country || '-'}</p>
                </div>

                {(cells || []).map((c: Record<string, any> = {}, i: number) => {
                  let rawRatioColor = ''
                  const rawRatio = c.rawRatio || 0
                  if (rawRatio > 0) {
                    rawRatioColor = '#dae3fc'
                  } else if (rawRatio < 0) {
                    rawRatioColor = '#ffedcc'
                  }
                  return (
                    <div
                      className="flex-1 h-14 border-left flex-center"
                      style={{
                        background: rawRatioColor || ''
                      }}
                      key={`${index}_${i}`}
                    >
                      <p className="text-base font-bold">{c.value || ''}</p>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MacroEconomicMap)
