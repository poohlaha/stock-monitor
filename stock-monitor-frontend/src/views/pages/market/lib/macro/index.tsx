/**
 * @fileOverview 全球宏观
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import MacroEconomicMap from '@pages/market/lib/macro/economic'
import MacroHotIndicator from '@pages/market/lib/macro/indicator'
import GroupTemplate from '@views/components/group/one'

const MarketGlobalMacro = (): ReactElement => {
  const render = () => {
    return (
      <GroupTemplate title="全球宏观" bodyNeedMargin={false} className="mt-8">
        {/* 经济指标热图 */}
        <MacroEconomicMap />

        {/* 热门指标 */}
        <MacroHotIndicator />
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MarketGlobalMacro)
