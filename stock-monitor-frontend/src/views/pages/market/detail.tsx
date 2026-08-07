/**
 * @fileOverview 市场详情
 * @date 2023-08-28
 * @author poohlaha
 */
import React, {ReactElement, useEffect, useRef, useState} from 'react'
import { observer } from 'mobx-react-lite'
import useMount from '@hooks/useMount'
import { ADDRESS } from '@utils/base'
import { useStore } from '@views/stores'
import {IKDataItemProps, ShareLine} from '@pages/time-k-line'
import Page from '@views/modules/page'
import Utils from '@utils/utils'
import { getRateClassName } from '@pages/utils'
import Loading from '@views/components/loading/loading'

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

    let height = 350
    setSize({ width, height })

    await onInit(c, m, t)
  })

  const onInit = async (c: string = '', m: string = '', t: string = '') => {
    await marketStore.onJudgeIsTrade(m)
    await marketStore.getTimelineData(c, m, t)
    await marketStore.onGetOtherTimelineData(c, m, t,'kline', 'day')
    await marketStore.onGetOtherTimelineData(c, m, t,'kline', 'week')
    await marketStore.onGetOtherTimelineData(c, m, t,'kline', 'month')

    // 除了基金外, 交易需要开启定时
    if (marketStore.isTrade && t !== 'fund') {

    }
  }

  // 开启定时
  const startTimelineTimer = (c: string = '', m: string = '', t: string = '') => {
    const loop = async () => {
      await marketStore.getTimelineData(c, m, t, false)
      // @ts-ignore
      timerRef.current = setTimeout(loop, 3000)
    }

    loop()
  }

  useEffect(() => {
    if (marketStore.isTrade && type !== 'fund') {
      startTimelineTimer(code, market, type)
    }

    return () => {
      clearTimeout(timerRef.current)
    }
  }, [code, market, type, marketStore.isTrade])


  const getCurrentFundManager = () => {
    let currentFundManager = marketStore.basicInfo?.Data_currentFundManager || []
    if (typeof currentFundManager === 'string') {
      try {
        currentFundManager = JSON.parse(currentFundManager.replace(/'/g, '"')) || []
      } catch (e) {
        console.error(e)
        currentFundManager = []
      }
    }

    return currentFundManager || []
  }

  // 获取基金经理
  const getManager = () => {
    const currentFundManagerList = getCurrentFundManager()
    if (currentFundManagerList.length === 0) {
      return {}
    }

    const currentFundManager = currentFundManagerList[0] || {}
    if (Utils.isObjectNull(currentFundManager)) {
      return {}
    }

    return {
      name: currentFundManager.name || '',
      workTime: (currentFundManager.workTime || '').replace('又', ''),
      fundSize: currentFundManager.fundSize || '',
      power: currentFundManager.power || {},
      profit: currentFundManager.profit || {}
    }
  }

  // 成立以来的收益
  const getAllRate = () => {
    const manager = getManager()
    const profit = manager.profit || {}
    if (Utils.isObjectNull(profit)) {
      return {
        className: '',
        value: '-'
      }
    }

    const series = profit.series || []
    if (series.length === 0) {
      return {
        className: '',
        value: '-'
      }
    }

    const data = (series[0] || {}).data || []
    if (data.length === 0) {
      return {
        className: '',
        value: '-'
      }
    }

    const obj = data[0] || {}
    if (Utils.isObjectNull(obj)) {
      return {
        className: '',
        value: '-'
      }
    }

    return {
      className: getRateClassName(obj.y || 0),
      value: `${obj.y || 0}%`
    }
  }

  const getNetWorthTrendList = () => {
    let netWorthTrendList = marketStore.basicInfo?.Data_netWorthTrend || []
    if (typeof netWorthTrendList === 'string') {
      try {
        netWorthTrendList = JSON.parse(netWorthTrendList.replace(/'/g, '"')) || []
      } catch (e) {
        console.error(e)
        netWorthTrendList = []
      }
    }

    return netWorthTrendList
  }

  const getFluctuationScale = () => {
    let fluctuationScale = marketStore.basicInfo?.Data_fluctuationScale || {}

    if (typeof fluctuationScale === 'string') {
      try {
        fluctuationScale = JSON.parse(fluctuationScale.replace(/'/g, '"')) || {}
      } catch (e) {
        console.error(e)
        fluctuationScale = {}
      }
    }

    return fluctuationScale
  }

  // 基金规模
  const getFundScale = () => {
    const fluctuationScale = getFluctuationScale() || {}
    if (Utils.isObjectNull(fluctuationScale)) {
      return '-'
    }

    const categories = fluctuationScale.categories || []
    const series = fluctuationScale.series || []
    if (series.length === 0) {
      return '-'
    }

    const serie = series[series.length - 1] || {}
    const serieValue = serie.y || 0
    if (categories.length === 0) {
      return `${serieValue}亿元`
    }

    return `${serieValue}亿元(${categories[categories.length - 1]})`
  }

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
  const onDailyGetMoreData =  async () => {
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

  const render = () => {
    return (
      <Page contentClassName="market-detail-page overflow-y-auto flex-direction-column pt-4 pb-4">
        {!marketStore.loading && (
          <>
            {/* 基金信息 */}
            <div className="fund-info">
              <div className="flex-direction-column pl-4 pr-4 rounded-md">
                <div className="flex-direction-column">
                  <p className="text-3xl font-bold">{marketStore.basicInfo?.name || ''}</p>
                  <div className="flex-align-center mt-1">
                    <p className="bg-purple-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1">
                      {marketStore.basicInfo?.exchange || ''}
                    </p>
                    <p className="ml-1 color-gray font-bold">{marketStore.basicInfo?.code || ''}</p>
                  </div>
                </div>

                <div className="mt-3 flex-direction-column">
                  <div className="flex-align-end">
                    <p className={`text-4xl font-bold ${getRateClassName(marketStore.basicInfo?.ratio)}`}>{marketStore.basicInfo?.price || 0}</p>
                    <p className={`ml-1 ${getRateClassName(marketStore.basicInfo?.ratio)}`}>元</p>
                    <p className={`ml-2 font-bold ${getRateClassName(marketStore.basicInfo?.increase)}`}>
                      {marketStore.basicInfo?.increase || 0}
                    </p>
                    <p className={`ml-2 font-bold ${getRateClassName(marketStore.basicInfo?.ratio)}`}>
                      {marketStore.basicInfo?.ratio || 0}
                    </p>
                  </div>

                  <div className="flex-align-center mt-2">
                    <p className="font-bold red">{marketStore.basicInfo?.tradeStatusCN || ''}</p>
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
                              data:marketStore.monthList || [],
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
          </>
        )}

        {marketStore.loading && <Loading show={marketStore.loading} />}
      </Page>
    )
  }

  return render()
}

export default observer(MarketDetail)
