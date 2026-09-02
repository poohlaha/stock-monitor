/**
 * @fileOverview 交易中显示分时图
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ShareLine } from '../../../time-k-line'
import Utils from '@utils/utils'
import { getColor } from '@pages/utils'

interface IMarketDetailTimelineProps {
  pankouInfo: Record<string, any>
  size: Record<string, any>
  timelineList: Array<any>
  fiveDayList: Array<any>
  klineList: Array<any>
  weekList: Array<any>
  monthList: Array<any>
  xLabels: Array<string>
  preClosePrice: number
  onTabChange: (value: string) => void
  floatStockCommentary: Array<Record<string, any>>
  fiveInfo: Record<string, any>
  resetSize: Function
}

const MarketDetailTimeline = (props: IMarketDetailTimelineProps): ReactElement => {
  const count = 100 // 首次加载100条
  const limit = 30 // 每次加载30条数据

  const [dailyEndIndex, setDailyEndIndex] = useState(count)
  const [weekEndIndex, setWeekEndIndex] = useState(count)
  const [monthEndIndex, setMonthEndIndex] = useState(count)
  const [isCollapse, setIsCollapse] = useState(false)
  const [tabActiveIndex, setTabActiveIndex] = useState(0)

  // 获取盘口信息
  const getPankouInfo = () => {
    if (Utils.isObjectNull(props.pankouInfo || {})) {
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
    for (let key in props.pankouInfo) {
      const item = props.pankouInfo[key] || {}
      const statusClassName = getStatusClassName(item.status || '')
      arr.push(
        <div
          className="pankou-item flex-align-center flex-jsc-between pl-4 pr-4 mb-2"
          key={key}
          style={{ width: '25%' }}
        >
          <p className="whitespace-nowrap">{item.name || ''}</p>
          <p className={`ml-2 font-bold whitespace-nowrap ${statusClassName || ''}`}>{item.value || '-'}</p>
        </div>
      )
    }

    return arr
  }

  /**
   * 获取日 K 数据
   */
  const getDailyKData = (start: number, end: number) => {
    return (props.klineList || []).slice(start, end).sort((a: any, b: any) => a.timestamp - b.timestamp)
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
    return (props.weekList || []).slice(start, end).sort((a: any, b: any) => a.timestamp - b.timestamp)
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
    return (props.monthList || []).slice(start, end).sort((a: any, b: any) => a.timestamp - b.timestamp)
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

  // 股评
  const getFloatStockCommentary = () => {
    const list = props.floatStockCommentary || []
    if (list.length === 0) {
      return null
    }

    return (
      <div className="absolute top-16 left-0 right-0 overflow-hidden">
        <div className="stock-ticker">
          {(list || []).map((l: Record<string, any> = {}, index: number) => {
            return (
              <p className="mr-14 shrink-0 whitespace-nowrap notice pt-1 pb-1 pl-2 pr-2 rounded-md" key={index}>
                {l.text || ''}
              </p>
            )
          })}
        </div>
      </div>
    )
  }

  // 买卖5档
  const getFiveBuySale = () => {
    const buyInfoList = (props.fiveInfo?.buyInfoList || []).slice(0, 5)
    const askInfoList = (props.fiveInfo?.askInfoList || []).slice(0, 5)
    const detailInfoList = (props.fiveInfo?.detailInfoList || []).slice().reverse()

    const buy = (buyInfoList || []).reduce((sum: number, b: Record<string, any>) => {
      return sum + Number(b.bidprice || 0)
    }, 0)

    const ask = (askInfoList || []).reduce((sum: number, b: Record<string, any>) => {
      return sum + Number(b.askprice || 0)
    }, 0)

    const total = buy + ask
    const buyWidth = total > 0 ? (buy / total) * 100 : 0
    const askWidth = total > 0 ? (ask / total) * 100 : 0

    let askIndex = askInfoList.length + 1
    return (
      <div className={`flex pt-12 h100 ${isCollapse ? 'w-5 min-w-5' : 'min-w-[250px] w-[250px]'} pl-2 pr-2`}>
        <div
          className="w-5 min-w-5 flex-center h100 bg-line-hover hover:rounded-t-lg hover:rounded-b-lg"
          onClick={() => {
            setIsCollapse(v => !v)
            props.resetSize?.()
          }}
        >
          <svg
            className={`w-4 h-4 color-gray transition-transform ${isCollapse ? 'rotate-180' : ''}`}
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M562.005333 512l-211.2-211.2 60.330667-60.288L682.666667 512l-271.530667 271.530667-60.330667-60.373334 211.2-211.2z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <div className={`pl-1 transition-all ${isCollapse ? 'hidden' : 'flex-1 flex-direction-column'}`}>
          <div className="flex-align-center w-full gap-2">
            <div
              className="h-4 rounded-l"
              style={{
                background: getColor(1),
                width: `${buyWidth}%`
              }}
            />

            <div
              className="h-4 rounded-r"
              style={{
                background: getColor(-1),
                width: `${askWidth}%`
              }}
            />
          </div>

          {/* 卖 */}
          <div className="mt-1 flex-direction-column pb-1 border-bottom">
            {(askInfoList || []).map((a: Record<string, any> = {}, index: number) => {
              const bid = Math.round((Number(a.askvolume) || 0) / 100)
              askIndex -= 1
              return (
                <div className="flex-align-center h-4 w100" key={index}>
                  <p className="flex-1 whitespace-nowrap">卖 {askIndex}</p>
                  <p className="flex-2 flex-center red">{a.askprice || '0'}</p>
                  <p className="flex-1 text-r">{bid || 0}</p>
                </div>
              )
            })}
          </div>

          {/* 买 */}
          <div className="mt-1 flex-direction-column">
            {(buyInfoList || []).map((b: Record<string, any> = {}, index: number) => {
              const bid = Math.round((Number(b.bidvolume) || 0) / 100)
              return (
                <div className="flex-align-center h-4 w100" key={index}>
                  <p className="flex-1 whitespace-nowrap">买 {index}</p>
                  <p className="flex-2 flex-center red">{b.bidprice || '0'}</p>
                  <p className="flex-1 text-r">{bid || 0}</p>
                </div>
              )
            })}
          </div>

          {/* 分笔成交 */}
          <div className="mt-1 flex-direction-column">
            <div className="flex-center tag rounded-full h-7">
              <p>分笔成交</p>
            </div>
            <div className="flex-direction-column max-h-[80px] overflow-y-auto no-scrollbar pt-1">
              {(detailInfoList || []).map((info: Record<string, any>, index: number) => {
                const volume = Math.round(Number(info.volume || '0') / 100)
                const bsFlag = info.bsFlag || '-'
                let color = ''
                if (bsFlag.toUpperCase() === 'S') {
                  color = 'green'
                } else if (bsFlag.toUpperCase() === 'B') {
                  color = 'red'
                }

                return (
                  <div className="flex-align-center h-4 w100" key={index}>
                    <p className="flex-1">{info.formatTime || '-'}</p>
                    <p className="flex-2 flex-center">{info.price || '0'}</p>
                    <div className="flex-1 flex-jsc-end flex-align-center">
                      <p>{volume}</p>
                      <p className={`${color}`}>{bsFlag}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getWidth = () => {
    const width = props.size?.width || 0
    if (width === 0) {
      return 0
    }

    if (tabActiveIndex !== 0) {
      return props.size?.width
    }

    if (isCollapse) {
      return props.size?.width - 20
    }

    return props.size?.width - 250
  }

  const render = () => {
    return (
      <div className="timeline-box border rounded-md p-4 w100">
        <div className="pankou-info flex-align-center flex-wrap">{getPankouInfo()}</div>

        <div className="chart w100 flex">
          <div
            className="market-chart-timer flex-align-center relative"
            style={{ width: getWidth(), height: props.size?.height || 0, background: 'white' }}
          >
            <div className="flex-align-center h100" style={{ width: getWidth() }}>
              {tabActiveIndex === 0 && getFloatStockCommentary()}

              {props.timelineList.length > 0 && (
                <ShareLine
                  width={getWidth()}
                  height={props.size?.height || 0}
                  className="rounded-xl !border !border-gray-100"
                  time={{
                    data: props.timelineList || [],
                    closingPrice: props.preClosePrice,
                    basic: {
                      show: true,
                      data: props.preClosePrice,
                      lineColor: '#aea5f6',
                      textColor: '#aea5f6'
                    }
                  }}
                  dailyK={{
                    data: getDailyKData(0, count) || [] || [],
                    onGetMoreData: onDailyGetMoreData,
                    closingPrice: props.preClosePrice
                  }}
                  fiveTime={{
                    data: props.fiveDayList || [],
                    closingPrice: props.preClosePrice,
                    basic: {
                      show: true,
                      data: props.preClosePrice,
                      lineColor: '#f7c16b',
                      textColor: '#f4d793'
                    }
                  }}
                  weekK={{
                    data: props.weekList || [],
                    onGetMoreData: onWeekGetMoreData
                  }}
                  monthK={{
                    data: props.monthList || [],
                    onGetMoreData: onWeekGetMonthData
                  }}
                  tabs={{
                    activeIndex: tabActiveIndex,
                    onTabClick: async (index: number, item: { [K: string]: any }) => {
                      console.log('On Tab Click, index: ', index, ', item: ', item)
                      setTabActiveIndex(index)
                      props.resetSize?.()
                      props.onTabChange?.(item.value)
                    }
                  }}
                  grid={{
                    show: false
                  }}
                  axis={{
                    needAxisXLine: false,
                    needAxisYLine: false,
                    xLabels: props.xLabels || []
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
            </div>

            {tabActiveIndex === 0 && getFiveBuySale()}
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailTimeline)
