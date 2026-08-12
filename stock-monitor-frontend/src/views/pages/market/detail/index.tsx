/**
 * @fileOverview 市场详情 - ETF
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ADDRESS } from '@utils/base'
import { useStore } from '@views/stores'
import Page from '@views/modules/page'
import Utils from '@utils/utils'
import { getRateClassName } from '@pages/utils'
import { useNavigate } from 'react-router'

import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'

import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import RouterUrls from '@route/router.url.toml'

import MarketDetailTitle from '@pages/market/detail/title'
import MarketDetailTimeline from '@pages/market/detail/timeline'
import MarketDetailPosition from '@pages/market/detail/position'
import MarketDetailFundInfo from '@pages/market/detail/manager'
import MarketDetailCurveGraph from '@pages/market/detail/curveGraph'
import MarketDetailFnCurveGraph from '@pages/market/detail/fnCurveGraph'
import MarketDetailStock from '@pages/market/detail/stock'
import Loading from '@views/components/loading/loading'

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
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

const MarketDetail = (): ReactElement => {
  const { marketStore, homeStore } = useStore()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [type, setType] = useState('stock')
  const [market, setMarket] = useState('ab')
  const [exchange, setExchange] = useState('sh')
  const [fundTabs, setFundTabs] = useState<Array<any>>([])

  const [size, setSize] = useState({ width: 0, height: 0 })

  const [openDataInfo, setOpenDataInfo] = useState<Record<string, any>>({})

  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const tradeStatusTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    const c = ADDRESS.getAddressQueryString('code') || ''
    setCode(c)

    // 类型: etf | fund | stock
    const t = ADDRESS.getAddressQueryString('type') || ''
    setType(t)

    // 市场: ab | hk | us | sg
    const m = ADDRESS.getAddressQueryString('market') || ''
    setMarket(m)

    // 市场: ab | hk | us | sg
    const e = ADDRESS.getAddressQueryString('exchange') || ''
    setExchange(e)

    resetSize(t)
    onInit(c, m, t)
  }, [location.search])

  const resetSize = (t: string = '') => {
    if (Utils.isBlank(t || '')) {
      t = type
    }
    let chart = document.querySelector('.content-box')
    if (!chart) return

    const rect = chart.getBoundingClientRect()
    let width = rect.width - (t !== 'stock' ? 400 : 0)
    // console.log('content-box rect: ', rect, width, t)
    if (width < 500) {
      width = 500
    }

    let height = 350
    setSize({ width, height })
  }

  const onInit = async (c: string = '', m: string = '', t: string = '') => {
    console.log(`code: ${code}, type: ${t}, market: ${market}, exchange: ${exchange}`)

    const queue = []
    /*
         queue.push(
            new Promise(async resolve => {
              const res = marketStore.onGetBrief(c, m, t)
              resolve(res)
            })
        )

         queue.push(
          new Promise(async resolve => {
            const res = marketStore.queryPositionDistribution(c, m, t)
            resolve(res)
          })
        )
         */

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetOpenData(
          c,
          (openDataInfo: Record<string, any> = {}, tabs: Array<any> = []) => {
            setOpenDataInfo(openDataInfo || {})
            setFundTabs(tabs)
          },
          t
        )
        resolve(res)
      })
    )

    if (t !== 'fund') {
      queue.push(
        new Promise(async resolve => {
          const res = marketStore.onJudgeIsTrade(m)
          resolve(res)
        })
      )

      if (t === 'etf') {
        queue.push(
          new Promise(async resolve => {
            const res = marketStore.onGetIncome(c, m, t)
            resolve(res)
          })
        )
      }

      queue.push(
        new Promise(async resolve => {
          const res = marketStore.getTimelineData(c, m, t)
          resolve(res)
        })
      )

      queue.push(
        new Promise(async resolve => {
          const res = marketStore.onGetOtherTimelineData(c, m, t, 'kline', 'day')
          resolve(res)
        })
      )

      queue.push(
        new Promise(async resolve => {
          const res = marketStore.onGetOtherTimelineData(c, m, t, 'kline', 'week')
          resolve(res)
        })
      )

      queue.push(
        new Promise(async resolve => {
          const res = marketStore.onGetOtherTimelineData(c, m, t, 'kline', 'month')
          resolve(res)
        })
      )
    }

    if (t === 'stock') {
      queue.push(
        new Promise(async resolve => {
          const res = marketStore.onGetIndustryFundFlow(c, m)
          resolve(res)
        })
      )
    }

    await marketStore.batchSend(queue)
  }

  // 定时查询是否开盘
  const scheduleTradeStatus = () => {
    if (type === 'fund') {
      return
    }

    const now = new Date()

    const next = (marketStore.checkTradeSchedule || [])
      .map(time => {
        const [hour, minute] = time.split(':').map(Number)
        const date = new Date()
        date.setHours(hour)
        date.setMinutes(minute)
        date.setSeconds(0)
        date.setMilliseconds(0)

        if (date <= now) {
          date.setDate(date.getDate() + 1)
        }

        return date
      })
      .sort((a, b) => a.getTime() - b.getTime())[0]

    const delay = next.getTime() - now.getTime()

    tradeStatusTimerRef.current = setTimeout(async () => {
      await marketStore.onJudgeIsTrade(market)
      scheduleTradeStatus()
    }, delay)
  }

  // 开启定时
  const startTimelineTimer = (c: string = '', m: string = '', t: string = '') => {
    const loop = async () => {
      await marketStore.getTimelineData(c, m, t)
      // @ts-ignore
      timerRef.current = setTimeout(loop, 3000)
    }

    loop()
  }

  useEffect(() => {
    scheduleTradeStatus()

    return () => {
      if (tradeStatusTimerRef.current) {
        clearTimeout(tradeStatusTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (marketStore.isTrade && type !== 'fund') {
      startTimelineTimer(code, market, type)
    }

    return () => {
      clearTimeout(timerRef.current)
    }
  }, [code, market, type, marketStore.isTrade])

  useEffect(() => {
    const handleResize = () => {
      resetSize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 获取净值等信息
  const getBasicIInfo = () => {
    if (!Utils.isObjectNull(marketStore.basicInfo || {})) {
      return marketStore.basicInfo || {}
    }

    const newest = openDataInfo.newest || []
    if (newest.length === 0) {
      return {}
    }

    const railFallNewest = newest[0] || {}
    const priceNewest = newest.length > 1 ? newest[1] || {} : {}
    const ratioNewest = newest.length > 2 ? newest[2] || {} : {}
    return {
      railFallNewest,
      priceNewest,
      ratioNewest
    }
  }

  const render = () => {
    return (
      <Page
        contentClassName="market-detail-page overflow-y-auto flex-direction-column pt-4 pb-4 no-scrollbar"
        title={{
          show: false
        }}
      >
        {!marketStore.loading && (
          <>
            {/* 基金信息 */}
            <MarketDetailTitle
              name={marketStore.basicInfo?.name || openDataInfo.name || ''}
              code={marketStore.basicInfo?.code || openDataInfo.brief?.code || ''}
              exchange={exchange}
              tags={openDataInfo.tags || []}
              tagList={marketStore.tagList || []}
              type={type}
              basicInfo={getBasicIInfo()}
            />

            {/* 分时图 | 持仓 */}
            <div className="content-box mt-4 h-[550px] flex">
              {/* 分时图 */}
              {type === 'fund' ? (
                <MarketDetailFnCurveGraph
                  resetSize={resetSize}
                  size={size}
                  performanceGraph={marketStore.performanceGraph || []}
                  networthGraph={marketStore.networthGraph || []}
                  tabs={fundTabs}
                  onTabChange={async (_: string = '', tab: string, index: number, month: string = '') => {
                    await marketStore.onGetPNGraph(tab, code, index, month)
                  }}
                />
              ) : (
                <MarketDetailTimeline
                  pankouInfo={marketStore.pankouInfo || {}}
                  size={size}
                  timelineList={marketStore.timelineList || []}
                  klineList={marketStore.klineList || []}
                  weekList={marketStore.weekList || []}
                  monthList={marketStore.monthList || []}
                  xLabels={marketStore.xLabels || []}
                  preClosePrice={marketStore.preClosePrice || 0}
                  onTabChange={async value => {
                    console.log('timelineList: ', marketStore.timelineList)
                    if (value === 'five') {
                      await marketStore.onGetOtherTimelineData(code, market, type, 'fiveday')
                    }
                  }}
                />
              )}

              {/* 股票持仓 */}
              {type !== 'stock' && (
                <MarketDetailPosition
                  position={openDataInfo.position || {}}
                  onStockClick={(item: Record<string, any> = {}) => {
                    const type = 'stock' // 类型: etf | fund | stock
                    const market = item.market || '' // 市场: ab | hk | us | sg
                    const exchange = item.exchange || ''
                    homeStore.selectedMenu = `${RouterUrls.MARKET.KEY || ''}-${homeStore.MENU_LIST[2].key || ''}`
                    console.log(
                      `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.DETAIL.URL}/${item.code || ''}?code=${item.code || ''}&type=${type || ''}&market=${market || ''}&exchange=${exchange}`
                    )
                    navigate(
                      `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.DETAIL.URL}/${item.code || ''}?code=${item.code || ''}&type=${type || ''}&market=${market || ''}&exchange=${exchange}`
                    )
                  }}
                />
              )}
            </div>

            {/* 涨跌幅 */}
            {type !== 'stock' && (
              <div className="mt-4 bg-[#f7f7f7] flex-align-center h-20 p-4 round-md">
                {(openDataInfo.recent || []).map((item: Record<string, any> = {}, index: number) => {
                  return (
                    <div className="flex-1 flex-direction-column" key={index}>
                      <p>{item.text || ''}</p>
                      <p className={`${getRateClassName(item.value)} text-xl font-bold`}>{item.value || '-'}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 基金信息 */}
            {type === 'fund' && (
              <MarketDetailFundInfo fundManager={openDataInfo.fundManager || {}} brief={openDataInfo.brief || {}} />
            )}

            {/* 持仓分布 | 收益 */}
            {type !== 'stock' && (
              <MarketDetailCurveGraph
                position={openDataInfo.position || {}}
                incomeList={marketStore.incomeList || []}
                resetSize={resetSize}
                needIncomeGraph={type !== 'fund'}
              />
            )}

            {/* 股票信息 */}
            {type === 'stock' && <MarketDetailStock resetSize={resetSize} code={code} market={market} />}
          </>
        )}

        {marketStore.loading && <Loading show={marketStore.loading} />}
      </Page>
    )
  }

  return render()
}

export default observer(MarketDetail)
