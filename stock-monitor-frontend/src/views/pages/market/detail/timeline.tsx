/**
 * @fileOverview 交易中显示分时图
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ShareLine } from '@pages/time-k-line'
import Utils from '@utils/utils'

interface IMarketDetailTimelineProps {
  pankouInfo: Record<string, any>
  size: Record<string, any>
  timelineList: Array<any>
  klineList: Array<any>
  weekList: Array<any>
  monthList: Array<any>
  xLabels: Array<string>
  preClosePrice: number
  onTabChange: (value: string) => void
}

const MarketDetailTimeline = (props: IMarketDetailTimelineProps): ReactElement => {
  const count = 100 // 首次加载100条
  const limit = 30 // 每次加载30条数据

  const [dailyEndIndex, setDailyEndIndex] = useState(count)
  const [weekEndIndex, setWeekEndIndex] = useState(count)
  const [monthEndIndex, setMonthEndIndex] = useState(count)

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
    return (props.klineList || []).slice(start, end)
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
    return (props.weekList || []).slice(start, end)
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
    return (props.monthList || []).slice(start, end)
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
      <div className="timeline-box border rounded-md p-4 w100">
        <div className="pankou-info flex-align-center flex-wrap">{getPankouInfo()}</div>

        <div className="chart w100 flex-center">
          <div
            className="market-chart-timer flex-center flex-direction-column"
            style={{ width: props.size?.width || 0, height: props.size?.height || 0, background: 'white' }}
          >
            {props.timelineList.length > 0 && (
              <ShareLine
                width={props.size?.width || 0}
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
                  data: props.timelineList || [],
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
                  activeIndex: 0,
                  onTabClick: async (index: number, item: { [K: string]: any }) => {
                    console.log('On Tab Click, index: ', index, ', item: ', item)
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
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailTimeline)
