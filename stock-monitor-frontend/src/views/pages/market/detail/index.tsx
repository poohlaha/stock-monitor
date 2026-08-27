/**
 * @fileOverview 市场详情 - ETF
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ADDRESS, TOAST } from '@utils/base'
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
import { BarChart, PieChart, LineChart, CustomChart } from 'echarts/charts'
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
import AddSelectionModal from '@pages/market/addSelection'
import MarketDetailEtfBasicInfo from '@pages/market/detail/eftInfo'

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
  CanvasRenderer,
  CustomChart
])

const MarketDetail = (): ReactElement => {
  const { marketStore, homeStore } = useStore()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [type, setType] = useState('stock')
  const [market, setMarket] = useState('ab')
  const [exchange, setExchange] = useState('sh')
  const [hasInCollect, setHasInCollect] = useState<boolean>(false)
  const [onOpenSelection, setOnOpenSelection] = useState<boolean>(false)

  const [size, setSize] = useState({ width: 0, height: 0 })

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

    console.log(`code: ${c}, type: ${t}, market: ${m}, exchange: ${m}`)

    resetSize(t)

    onInit(c, m, t)

    return () => {
      marketStore.reset()
    }
  }, [location.search])

  const resetSize = (t: string = '') => {
    if (Utils.isBlank(t || '')) {
      t = type
    }

    let chart = document.querySelector('.content-box')
    if (!chart) return

    const rect = chart.getBoundingClientRect()
    let width = rect.width - (t !== 'stock' ? 400 : 0) - 32
    // console.log('content-box rect: ', rect, width, t)
    if (width < 500) {
      width = 500
    }

    let height = 350
    console.log('width: ', width, ';height: ', height)
    setSize({ width, height })
  }

  const onInit = async (c: string = '', m: string = '', t: string = '') => {

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
        const res = await marketStore.onGetMyListByCode(c, (obj: Array<Record<string, any>> = []) => {
          setHasInCollect(obj.length > 0)
        })
        resolve(res)
      })
    )

    if (t === 'fund') {
      queue.push(
        new Promise(async resolve => {
          const res = await marketStore.onGetFundInfoData(c, t, m, exchange)
          resolve(res)
        })
      )
    }

    if (t !== 'fund') {
      queue.push(
        new Promise(async resolve => {
          const res = await marketStore.onJudgeIsTrade(m)
          resolve(res)
        })
      )

      if (t === 'etf') {
        queue.push(
          new Promise(async resolve => {
            const res = await marketStore.onGetIncome(c, m, t)
            resolve(res)
          })
        )

        queue.push(
          new Promise(async resolve => {
            const res = await marketStore.onGetBrief(c, m, t)
            resolve(res)
          })
        )
      }

      queue.push(
        new Promise(async resolve => {
          const res = await marketStore.getTimelineData(c, m, t)
          resolve(res)
        })
      )

      queue.push(
        new Promise(async resolve => {
          const res = await marketStore.onGetOtherTimelineData(c, m, t, 'kline', 'day')
          resolve(res)
        })
      )

      queue.push(
        new Promise(async resolve => {
          const res = await marketStore.onGetOtherTimelineData(c, m, t, 'kline', 'week')
          resolve(res)
        })
      )

      queue.push(
        new Promise(async resolve => {
          const res = await marketStore.onGetOtherTimelineData(c, m, t, 'kline', 'month')
          resolve(res)
        })
      )
    }

    if (t === 'stock') {
      queue.push(
        new Promise(async resolve => {
          const res = await marketStore.onGetIndustryFundFlow(c, m)
          resolve(res)
        })
      )
    }

    await marketStore.batchSend(queue)

    if (t === 'stock') {
      setTimeout(async () => {
        await marketStore.onGetStockNews(c, m)
      }, 500)

      setTimeout(async () => {
        await marketStore.onGetCompanyProfile(c, m)
      }, 500)

      setTimeout(async () => {
        await marketStore.onGetFloatStockCommentary(c, m)
      }, 500)

      setTimeout(async () => {
        await marketStore.onGetRelatedTargets(c, m)
      }, 500)
    }
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
      timerRef.current = setTimeout(loop, 5000)
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

  const getBasicInfo = (priceChange: Array<Record<string, any>> = []) => {
    const fundInfo = marketStore.openDataInfo?.fundInfo || {} // 基金信息
    let basicInfo: Record<string, any> = {
      ...(marketStore.openDataInfo?.basicInfo || {}),
      latestChange: fundInfo.latestChange || '',
      latestNav: fundInfo.latestNav || '',
      latestNavDate: fundInfo.latestNavDate || ''
    } // 基础信息: 资产和标签等

    if (priceChange.length > 0) {
      const obj = (priceChange || []).find((c: Record<string, any> = {}) => c.period === '1year') || {}
      basicInfo.oneYearPriceChange = obj || {}
    }

    return basicInfo
  }

  const render = () => {
    const priceChange: Array<Record<string, any>> = marketStore.openDataInfo?.priceChange || [] // 涨跌幅
    let basicInfo: Record<string, any> = getBasicInfo(priceChange || [])

    const asset = basicInfo.asset || {} // 资产信息
    const ex = Utils.isBlank(exchange || '') ? asset.exchange || '' : exchange || ''
    return (
      <Page
        contentClassName="market-detail-page overflow-y-auto flex-direction-column pt-4 pb-4 no-scrollbar"
        title={{
          show: false
        }}
      >
        {!marketStore.loading && (
          <>
            {/* 信息 */}
            <MarketDetailTitle
              hasInCollect={hasInCollect}
              name={asset.name || ''}
              code={asset.code || ''}
              exchange={ex}
              tagList={marketStore.tagList || []}
              type={type}
              basicInfo={basicInfo}
              onAddSelection={async () => {
                await marketStore.onGetWatchGroupList(() => {
                  setOnOpenSelection(true)
                })
              }}
            />

            {/* 分时图 | 持仓 */}
            <div className="content-box mt-4 h-[600px] flex">
              {/* 分时图 */}
              {type === 'fund' ? (
                <MarketDetailFnCurveGraph
                  resetSize={resetSize}
                  size={size}
                  performanceGraph={marketStore.performanceGraph || []}
                  networthGraph={marketStore.networthGraph || []}
                  onTabChange={async (tabIndex: string = '', month: string = '') => {
                    await marketStore.onGetPNGraph(tabIndex, code, month)
                  }}
                />
              ) : (
                <MarketDetailTimeline
                  pankouInfo={marketStore.pankouInfo || {}}
                  size={size}
                  timelineList={marketStore.timelineList || []}
                  fiveDayList={marketStore.fiveDayList || []}
                  klineList={marketStore.klineList || []}
                  weekList={marketStore.weekList || []}
                  monthList={marketStore.monthList || []}
                  xLabels={marketStore.xLabels || []}
                  preClosePrice={marketStore.preClosePrice || 0}
                  floatStockCommentary={marketStore.floatStockCommentary || []}
                  fiveInfo={marketStore.pankouInfo?.fiveInfo || {}}
                  resetSize={resetSize}
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
                  holding={marketStore.openDataInfo?.holding || []}
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
                {(priceChange || []).map((item: Record<string, any> = {}, index: number) => {
                  return (
                    <div className="flex-1 flex-direction-column" key={index}>
                      <p>{item.name || ''}</p>
                      <p className={`${getRateClassName(item.priceChange || '0')} text-xl font-bold`}>
                        {Number(item.priceChange || '0').toFixed(2)}%
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {type === 'etf' && <MarketDetailEtfBasicInfo info={marketStore.briefInfo || {}} />}

            {/* 基金信息 */}
            {type === 'fund' && (
              <MarketDetailFundInfo
                fundManagerList={marketStore.openDataInfo?.manager || []}
                fundInfo={marketStore.openDataInfo?.fundInfo || {}}
              />
            )}

            {/* 持仓分布 | 收益 */}
            {type !== 'stock' && (
              <MarketDetailCurveGraph
                position={{}}
                allocationList={marketStore.openDataInfo?.allocation || []}
                industryList={marketStore.openDataInfo?.industry || []}
                historyList={marketStore.openDataInfo?.history || []}
                incomeList={[]}
                resetSize={resetSize}
                needIncomeGraph={type !== 'fund'}
              />
            )}

            {/* 股票信息 */}
            {type === 'stock' && <MarketDetailStock resetSize={resetSize} code={code} market={market} />}
          </>
        )}

        <AddSelectionModal
          open={onOpenSelection}
          name={asset.name || ''}
          code={code}
          market={market}
          type={type}
          exchange={ex}
          onOk={async () => {
            await marketStore.onGetMyListByCode(code, (obj: Array<Record<string, any>> = []) => {
              TOAST.show({ message: '添加自选成功', type: 2 })
              setHasInCollect(obj.length > 0)
              setOnOpenSelection(false)
            })
          }}
          onCancel={() => {
            setOnOpenSelection(false)
          }}
        />

        {marketStore.loading && <Loading show={marketStore.loading} />}
      </Page>
    )
  }

  return render()
}

export default observer(MarketDetail)
