/**
 * @fileOverview 市场详情
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import useMount from '@hooks/useMount'
import { ADDRESS } from '@utils/base'
import { useStore } from '@views/stores'
import { ShareLine } from '@pages/time-k-line'
import Page from '@views/modules/page'
import Utils from '@utils/utils'
import { getRateClassName } from '@pages/utils'
import Loading from '@views/components/loading/loading'

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
  const { marketStore } = useStore()

  const count = 100 // 首次加载100条
  const limit = 30 // 每次加载30条数据

  const [code, setCode] = useState('')
  const [type, setType] = useState('stock')
  const [market, setMarket] = useState('ab')
  const [dailyEndIndex, setDailyEndIndex] = useState(count)
  const [weekEndIndex, setWeekEndIndex] = useState(count)
  const [monthEndIndex, setMonthEndIndex] = useState(count)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const tradeStatusTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const positionPieChartRef = useRef(null)
  const positionBarChartRef = useRef(null)
  const incomeBarChartRef = useRef(null)
  const pieChartRef = useRef<echarts.ECharts | null>(null)
  const barChartRef = useRef<echarts.ECharts | null>(null)
  const incomeChartRef = useRef<echarts.ECharts | null>(null)

  useMount(async () => {
    const c = ADDRESS.getAddressQueryString('code') || ''
    setCode(c)

    // 类型: etf | fund | stock
    const t = ADDRESS.getAddressQueryString('type') || ''
    setType(t)

    // 市场: ab | hk | us | sg
    const m = ADDRESS.getAddressQueryString('market') || ''
    setMarket(m)

    let chart = document.querySelector('.chart')
    if (!chart) return

    const rect = chart.getBoundingClientRect()
    let width = rect.width
    if (width < 500) {
      width = 500
    }

    resetSize()
    await onInit(c, m, t)
  })

  const resetSize = () => {
    let chart = document.querySelector('.chart')
    if (!chart) return

    const rect = chart.getBoundingClientRect()
    let width = rect.width
    if (width < 500) {
      width = 500
    }

    let height = 350
    setSize({ width, height })
  }

  const onInit = async (c: string = '', m: string = '', t: string = '') => {
    const queue = []
    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onJudgeIsTrade(m)
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.queryPositionDistribution(c, m, t)
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetBrief(c, m, t)
        resolve(res)
      })
    )

    queue.push(
        new Promise(async resolve => {
          const res = marketStore.onGetOpenData(c)
          resolve(res)
        })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetIncome(c, m, t)
        resolve(res)
      })
    )

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

    await marketStore.batchSend(queue)
  }

  // 定时查询是否开盘
  const scheduleTradeStatus = () => {
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

  // 获取盘口信息
  const getPankouInfo = () => {
    if (Utils.isObjectNull(marketStore.pankouInfo || {})) {
      return null
    }

    const getStatusClassName = (status: string = '') => {
      if (status === 'down') {
        return 'green'
      }

      if (status === 'up') {
        return 'red'
      }

      return ''
    }

    let arr = []
    for (let key in marketStore.pankouInfo) {
      const item = marketStore.pankouInfo[key] || {}
      const statusClassName = getStatusClassName(item.status || '')
      arr.push(
        <div
          className="pankou-item flex-align-center flex-jsc-between pl-4 pr-4 mb-2"
          key={key}
          style={{ width: '25%' }}
        >
          <p>{item.name || ''}</p>
          <p className={`ml-2 font-bold ${statusClassName || ''}`}>{item.value || '-'}</p>
        </div>
      )
    }

    return arr
  }

  /**
   * 获取日 K 数据
   */
  const getDailyKData = (start: number, end: number) => {
    return (marketStore.klineList || []).slice(start, end)
  }

  /**
   * 获取更多数据(日K)
   */
  const onDailyGetMoreData = async () => {
    const start = dailyEndIndex + limit
    const end = start + limit
    setDailyEndIndex(end)
    const data = getDailyKData(start, end)
    return Promise.resolve(data)
  }

  /**
   * 获取周 K 数据
   */
  const getWeekKData = (start: number, end: number) => {
    return (marketStore.weekList || []).slice(start, end)
  }

  /**
   * 获取更多数据(周K)
   */
  const onWeekGetMoreData = async () => {
    const start = weekEndIndex + limit
    const end = start + limit
    setWeekEndIndex(end)
    const data = getWeekKData(start, end)
    return Promise.resolve(data)
  }

  /**
   * 获取月 K 数据
   */
  const getMonthKData = (start: number, end: number) => {
    return (marketStore.monthList || []).slice(start, end)
  }

  /**
   * 获取更多数据(月K)
   */
  const onWeekGetMonthData = async () => {
    const start = monthEndIndex + limit
    const end = start + limit
    setMonthEndIndex(end)
    const data = getMonthKData(start, end)
    return Promise.resolve(data)
  }

  // 持仓-资产配置-饼图
  const getPositionPieChart = () => {
    if (!positionPieChartRef.current) return

    let data = []
    let list = (marketStore.positionDistributionInfo || {}).asset || []
    if (list.length > 0) {
      for (let l of list) {
        data.push({
          name: l.section || '',
          value: Number((l.ratio || '').replace('%', '') || '0.00') || 0.0
        })
      }
    }

    const chart = echarts.init(positionPieChartRef.current)
    const option = {
      title: {
        text: '资产分布',
        left: 'left'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          label: {
            show: true,
            formatter: (params: Record<string, any> = {}) => {
              return `${params.name}\n${params.value}%`
            }
          },
          data
        }
      ]
    }

    chart.setOption(option)
    return chart
  }

  // 持仓-行业-柱状图
  const getPositionBarChart = () => {
    if (!positionBarChartRef.current) return

    let data = []
    let yAxisData = []
    let list = (marketStore.positionDistributionInfo || {}).industry || []
    if (list.length > 0) {
      for (let l of list) {
        data.push({
          label: {
            position: 'right'
          },
          value: Number((l.ratio || '').replace('%', '') || '0.00') || 0.0
        })

        yAxisData.push(l.section || '')
      }
    }

    const chart = echarts.init(positionBarChartRef.current)
    const option = {
      title: {
        text: '行业分布',
        left: 'left'
      },
      tooltip: {
        show: false
      },
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          show: true,
          fontWeight: 'bold',
          fontSize: 14
        },
        data: yAxisData || []
      },
      series: [
        {
          type: 'bar',
          radius: '50%',
          barWidth: 30,
          label: {
            show: true,
            position: 'right',
            formatter: (params: Record<string, any> = {}) => {
              return `${params.value.toFixed(2)}%`
            }
          },
          data
        }
      ]
    }

    chart.setOption(option)
    return chart
  }

  // 收益率
  const getIncomeBarChart = () => {
    if (!incomeBarChartRef.current) return

    let xAxisData: Array<string> = []
    let series = []

    let list = marketStore.incomeList || []
    if (list.length > 1) {
      const oneData = list[0] || []
      const data = list.slice(1, list.length) || []
      xAxisData = data.map((l: Array<string> = []) => l[0] || '') || []

      const total = oneData.length > 1 ? oneData.length : 0
      if (total > 0) {
        for (let i = 1; i < total; i++) {
          const name = oneData[i] || ''
          const serieData = data
            .map((l: Array<string> = []) => {
              if (l[i] === '--') {
                return null
              }

              let value = l[i] || '0.00%'
              value = (value.replace('%', '') || '').trim()
              return Number(value)
            })
            .filter(s => s !== null)
          series.push({
            name,
            type: 'bar',
            barWidth: 30,
            barGap: '80%',
            label: {
              show: true,
              position: 'top',
              formatter: (params: Record<string, any> = {}) => {
                return `${params.value}%`
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: serieData
          })
        }
      }
    }

    const chart = echarts.init(incomeBarChartRef.current)
    let option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: false
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value'
      },
      series
    }

    chart.setOption(option)
    return chart
  }

  useEffect(() => {
    if (
      !positionBarChartRef.current ||
      !positionPieChartRef.current ||
      !incomeBarChartRef.current ||
      Utils.isObjectNull(marketStore.positionDistributionInfo || {})
    ) {
      return
    }

    const positionPieChart = getPositionPieChart()
    const positionBarChart = getPositionBarChart()
    const incomeBarChart = getIncomeBarChart()

    // @ts-ignore
    pieChartRef.current = positionPieChart

    // @ts-ignore
    barChartRef.current = positionBarChart

    // @ts-ignore
    incomeChartRef.current = incomeBarChart

    return () => {
      positionPieChart?.dispose()
      positionBarChart?.dispose()
      incomeBarChart?.dispose()
    }
  }, [marketStore.positionDistributionInfo || {}, marketStore.incomeList || []])

  useEffect(() => {
    const handleResize = () => {
      pieChartRef.current?.resize()
      barChartRef.current?.resize()
      resetSize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const render = () => {
    return (
      <Page
        contentClassName="market-detail-page overflow-y-auto flex-direction-column pt-4 pb-4"
        title={{
          show: false
        }}
      >
        {!marketStore.loading && (
          <>
            {/* 基金信息 */}
            <div className="fund-info mt-4">
              <div className="flex-direction-column pl-4 pr-4 rounded-md">
                {/* 标题 */}
                <div className="flex-direction-column">
                  <p className="text-3xl font-bold">{marketStore.basicInfo?.name || ''}</p>
                  <div className="flex-align-center mt-1">
                    <p className="bg-purple-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1">
                      {marketStore.basicInfo?.exchange || ''}
                    </p>
                    <p className="ml-1 color-gray font-bold">{marketStore.basicInfo?.code || ''}</p>
                  </div>
                </div>

                {/* 基金基本信息 */}
                <div className="basic-info bg-[#f5f6fa] p-4 flex-wrap mt-4 rounded-md">
                  <div className="flex-l pr-4 flex-align-center">
                    <p className="mr-2">成立日期:</p>
                    <p>{marketStore.briefInfo?.publishDate || '-'}</p>
                  </div>

                  <div className="flex-l pr-4 pl-4 flex-align-center">
                    <p className="mr-2">最新规模:</p>
                    <p>{marketStore.briefInfo?.aum || '-'}</p>
                  </div>

                  <div className="flex-l pr-4 pl-4 flex-align-center">
                    <p className="mr-2">管理人:</p>
                    <p>{marketStore.briefInfo?.primaryAdvisor || '-'}</p>
                  </div>

                  <div className="flex-l pr-4 pl-4 flex-align-center">
                    <p className="mr-2">净值(元):</p>
                    <p>{marketStore.briefInfo?.netWorth || '-'}</p>
                  </div>
                </div>

                <div className="mt-4 flex-direction-column">
                  <div className="flex-align-end">
                    <p className={`text-4xl font-bold ${getRateClassName(marketStore.basicInfo?.ratio)}`}>
                      {marketStore.basicInfo?.price || 0}
                    </p>
                    <p className={`ml-1 ${getRateClassName(marketStore.basicInfo?.ratio)}`}>元</p>
                    <p className={`ml-2 font-bold ${getRateClassName(marketStore.basicInfo?.increase)}`}>
                      {marketStore.basicInfo?.increase || 0}
                    </p>
                    <p className={`ml-2 font-bold ${getRateClassName(marketStore.basicInfo?.ratio)}`}>
                      {marketStore.basicInfo?.ratio || 0}
                    </p>
                  </div>

                  <div className="flex-align-center mt-2">
                    <p className="text-purple-500">{marketStore.basicInfo?.tradeStatusCN || ''}</p>
                    <p className="ml-1">{Utils.formatDate(new Date())}</p>
                    <p className="ml-1">{marketStore.basicInfo?.timezone || ''}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 交易中显示分时图 */}
            <div className="content-box mt-4">
              <div className="timeline-box border rounded-md flex-wrap">
                <div className="pankou-info flex-align-center flex-wrap p-4">{getPankouInfo()}</div>

                <div className="chart w100 flex-center">
                  <div
                    className="market-chart-timer flex-center flex-direction-column"
                    style={{ width: size.width, height: size.height, background: 'white' }}
                  >
                    {marketStore.timelineList.length > 0 && (
                      <ShareLine
                        width={size.width}
                        height={size.height}
                        className="rounded-xl !border !border-gray-100"
                        time={{
                          data: marketStore.timelineList || [],
                          closingPrice: marketStore.preClosePrice,
                          basic: {
                            show: true,
                            data: marketStore.preClosePrice,
                            lineColor: '#aea5f6',
                            textColor: '#aea5f6'
                          }
                        }}
                        dailyK={{
                          data: getDailyKData(0, count) || [] || [],
                          onGetMoreData: onDailyGetMoreData,
                          closingPrice: marketStore.preClosePrice
                        }}
                        fiveTime={{
                          data: marketStore.timelineList || [],
                          closingPrice: marketStore.preClosePrice,
                          basic: {
                            show: true,
                            data: marketStore.preClosePrice,
                            lineColor: '#f7c16b',
                            textColor: '#f4d793'
                          }
                        }}
                        weekK={{
                          data: marketStore.weekList || [],
                          onGetMoreData: onWeekGetMoreData
                        }}
                        monthK={{
                          data: marketStore.monthList || [],
                          onGetMoreData: onWeekGetMonthData
                        }}
                        tabs={{
                          activeIndex: 0,
                          onTabClick: async (index: number, item: { [K: string]: any }) => {
                            console.log('On Tab Click, index: ', index, ', item: ', item)
                            if (item.value === 'five') {
                              await marketStore.onGetOtherTimelineData(code, market, type, 'fiveday')
                            }
                          }
                        }}
                        grid={{
                          show: false
                        }}
                        axis={{
                          needAxisXLine: false,
                          needAxisYLine: false,
                          xLabels: marketStore.xLabels || []
                        }}
                        highest={{
                          show: false,
                          lineColor: '#FF4D4F',
                          textColor: 'red'
                        }}
                        cross={{
                          color: '#faad14'
                        }}
                        tooltip={{
                          show: true,
                          className: 'bg-white shadow-md'
                        }}
                        zoomStep={1.2}
                      />
                    )}

                    {/*
          <TimeLine
            className="bg-gray-100 rounded mt-3"
            width={600}
            height={356}
            axis={{
              // xLabels: ['09:30', '11:30/13:00', '15:00'],
              // yLabels: [8.1, 8.2, 8.3, 8.4],
              yPosition: 'left',
              needXLabelLine: false,
              needYLabelLine: false,
              needAxisXLine: true,
              needAxisYLine: true
            }}
            grid={{
              show: true
            }}
            data={TimeData.data.quote_data[0].value || []}
            fontSize={12}
            highest={{
              show: true,
              lineColor: '#FF4D4F',
              textColor: 'red'
            }}
            cross={{
              color: '#faad14'
            }}
            basic={{
              show: true,
              data: TimeData.data.quote_data[0].base_price,
              lineColor: '#aea5f6',
              textColor: '#aea5f6'
            }}
            tooltip={{
              className: 'bg-white'
              // background: '#ededed'
            }}
            closingPrice={TimeData.data.quote_data[0].closing_price}
          />

          <KLine
            className="bg-gray-100 rounded mt-5"
            width={650}
            height={400}
            data={KData.data?.quote_data[0]?.value || []}
            axis={{
              // xLabels: ['09:30', '11:30/13:00', '15:00'],
              // yLabels: [8.1, 8.2, 8.3, 8.4],
              yPosition: 'left',
              needXLabelLine: false,
              needYLabelLine: false,
              needAxisXLine: true,
              needAxisYLine: true
            }}
            grid={{
              show: true
            }}
            data={KData.data.quote_data[0].value || []}
            fontSize={12}
            highest={{
              show: true,
              lineColor: '#FF4D4F',
              textColor: 'red'
            }}
            cross={{
              color: '#faad14'
            }}
            basic={{
              show: true,
              data: KData.data.quote_data[0].base_price,
              lineColor: '#aea5f6',
              textColor: '#aea5f6'
            }}
            tooltip={{
              className: 'bg-white'
              // background: '#ededed'
            }}
            closingPrice={KData.data.quote_data[0].closing_price}
          />
           */}
                  </div>
                </div>
              </div>
            </div>

            {/* 持仓分布 | 收益 */}
            <div className="flex-wrap mt-4">
              {/* 持仓分布 */}
              <div className="flex-direction-column border rounded-md p-4 w100">
                <p className="text-2xl font-bold">持仓分布</p>
                <div className="mt-2 flex flex-nowrap gap-4 h-96">
                  <div className="flex-1 min-w-0 aspect-square h-full border-right" ref={positionPieChartRef}></div>
                  <div className="flex-1 min-w-0 aspect-square h-full" ref={positionBarChartRef}></div>
                </div>
              </div>

              {/* 收益率 */}
              <div className="flex-direction-column border rounded-md p-4 w100 mt-4">
                <p className="text-2xl font-bold">收益率</p>
                <div className="mt-2 h-96">
                  <div className="aspect-square h-full" ref={incomeBarChartRef}></div>
                </div>
              </div>
            </div>
          </>
        )}

        {marketStore.loading && <Loading show={marketStore.loading} />}
      </Page>
    )
  }

  return render()
}

export default observer(MarketDetail)
