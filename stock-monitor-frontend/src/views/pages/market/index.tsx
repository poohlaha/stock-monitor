/**
 * @fileOverview 市场
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import { useNavigate } from 'react-router'
import Page from '@views/modules/page'
import useMount from '@hooks/useMount'
import Search from './search'
import MarketGlobalMarket from '@pages/market/lib/global'
import MarketCenter from '@pages/market/lib/center'
import MacroIndustrialChain from '@pages/market/lib/industrial'
import MarketGlobalMacro from '@pages/market/lib/macro'
import MarketHostStock from '@pages/market/lib/hot'
import MarketFinancialCalendar from '@pages/market/lib/calendar'
import MarketBreakingNews from '@pages/market/lib/breakingNews'

import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'

import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, TreemapChart } from 'echarts/charts'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import RouterUrls from "@route/router.url.toml";

echarts.use([
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  PieChart,
  LineChart,
  TreemapChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

const Market = (): ReactElement => {
  const { marketStore } = useStore()
  const navigate = useNavigate()

  useMount(async () => {
    await onInit()
  })

  const onInit = async () => {
    const queue = []
    queue.push(
      new Promise(async resolve => {
        const res = await marketStore.onGetWorldwideName()
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = await marketStore.onGetWorldwideMarketCenter()
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetEconomicIndicators()
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetHotIndicators()
        resolve(res)
      })
    )

    await marketStore.batchSend(queue)

    setTimeout(async () => {
      await marketStore.onGetIndustrialChain()
    }, 500)

    setTimeout(async () => {
      await marketStore.onGetHotStock()
    }, 500)

    setTimeout(async () => {
      await marketStore.onGetFinancialCalendar()
    }, 500)

    setTimeout(async () => {
      await marketStore.onGetBreakingNews()
    }, 500)
  }

  /**
   * @param item: code, type, market, exchange
   *
   */
  const toDetailPage = (item: Record<any, any> = {}) => {
    navigate(
        `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.DETAIL.URL}/${item.code || ''}?code=${item.code || ''}&type=${item.type || ''}&market=${item.market || ''}&exchange=${item.exchange || ''}`
    )
  }

  const render = () => {
    return (
      <Page
        contentClassName="market-page overflow-y-auto flex-direction-column pt-4 pb-4 no-scrollbar"
        title={{
          show: false
        }}
      >
        {/* 搜索 */}
        <Search />

        {/* 全球市场 */}
        <MarketGlobalMarket />

        {/* 行情中心 */}
        <MarketCenter toDetailPage={(item: Record<any, any> = {}) => toDetailPage(item)} />

        {/* 7 * 24 快讯 */}
        <MarketBreakingNews />

        {/* 热股榜 */}
        <MarketHostStock />

        {/* 产业链 */}
        <MacroIndustrialChain />

        {/* 全球宏观 */}
        <MarketGlobalMacro />

        {/* 财经日历 */}
        <MarketFinancialCalendar />
      </Page>
    )
  }

  return render()
}

export default observer(Market)
