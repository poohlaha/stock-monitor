/**
 * @fileOverview 业绩走势 | 净值曲线
 * @date 2023-08-28
 * @author poohlaha
 */
import React, {ReactElement, useEffect, useRef, useState} from 'react'
import {observer} from 'mobx-react-lite'
import * as echarts from "echarts/core";
import {Tabs} from "antd";

interface IMarketDetailFnCurveGraphProps {
  resetSize: Function
  performanceGraph: Array<Record<string, any>>
  networthGraph: Array<Record<string, any>>
  size: Record<string, any>
  tabs: Array<Record<string, any>>
  onTabChange: (tabIndex: string, tab: string, index: number, month: string) => void
}

const MarketDetailFnCurveGraph = (props: IMarketDetailFnCurveGraphProps): ReactElement => {

  const items = [
    {
      label: '近1月',
      value: '1'
    },
    {
      label: '近3月',
      value: '3'
    },
    {
      label: '近6月',
      value: '6'
    },
    {
      label: '近1年',
      value: '12'
    },
    {
      label: '近3年',
      value: '36'
    },
    {
      label: '近5年',
      value: '60'
    },
    {
      label: '成立以来',
      value: '10'
    }
  ]

  const [fundPNCurveGraphTabIndex, setFundPNCurveGraphTabIndex] = useState('0')
  const [itemTabIndex, setItemTabIndex] = useState(items[3].value)

  const performanceLineChartRef = useRef(null)
  const networthLineChartRef = useRef(null)

  const performanceChartRef = useRef<echarts.ECharts | null>(null)
  const networthChartRef = useRef<echarts.ECharts | null>(null)


  // 获取净值曲线
  const onGetNetworthLineChart = () => {
    if (!networthLineChartRef.current || (props.networthGraph || []).length === 0) {
      return
    }

    const data = props.networthGraph || []
    const chart = echarts.init(networthLineChartRef.current)

    const d = data[0].data || []
    const xAxisData = (d || []).map((dd: Record<string, any> = {})=> dd.date) || []

    const convertToCumulative = (list: number[]) => {
      let total = 1

      return list.map(rate => {
        total = total * (1 + rate / 100)

        return Number(((total - 1) * 100).toFixed(2))
      })
    }

    const series = data.map((d: Record<string, any>) => {
      const dd = (d.data || []).length > 0 ? d.data.map((l: Record<string, any> = {}) => l.value2 || 0).filter(Boolean) : []
      return {
        ...d,
        lineStyle: {
          width: 1
        },
        dataOld: (d.data || []).length > 0 ? d.data.map((l: Record<string, any> = {}) => [l.value1 || 0, l.value2 || 0, l.value3 || 0]).filter(Boolean) : [],
        data: convertToCumulative(dd || [])
      }
    })

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter(params: Record<string, any>) {
          let html = `${params[0].axisValue}<br/>`
          params.forEach((item: Record<string, any>) => {
            const value = Number(item.value || 0)

            const color = value > 0
                ? '#f5222d'   // 红
                : value < 0
                    ? '#00a854' // 绿
                    : '#333'

            html += `
              ${item.marker}
              ${item.seriesName}:
              <b style="color:${color}">
                ${value > 0 ? '+' : ''}${value}%
              </b>
              <br/>
            `
          })

          return html
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        axisLine: {
          show: false
        },

        axisTick: {
          show: false
        },

        splitLine: {
          show: false
        }
      },
      yAxis: {
          type: false,

          axisLine: {
              show: false
          },

          axisTick: {
              show: false
          },

          splitLine: {
              show: false
          }
      },
      series
    }

    console.log('option: ', option)
    chart.setOption(option)
    return chart
  }

  // 获取业绩走势曲线
  const onGetFundPerformanceLineChart = () => {
    if (!performanceLineChartRef.current || (props.performanceGraph || []).length === 0) {
      return
    }

    const data = props.performanceGraph || []
    const chart = echarts.init(performanceLineChartRef.current)
    const legendData = (data || []).map((d: Record<string, any>) => d.name || '') || []

    const d = data[0].data || []
    const xAxisData = (d || []).map((dd: Record<string, any> = {})=> dd.date) || []

    const series = data.map((d: Record<string, any>) => {
      return {
        ...d,
        lineStyle: {
          width: 1
        },
        data: (d.data || []).length > 0 ? d.data.map((l: Record<string, any> = {}) => l.value || 0).filter(Boolean) : []
      }
    })

    const option = {
      legend: {
        data: legendData
      },
      tooltip: {
        trigger: 'axis',
        formatter(params: Record<string, any>) {
          let html = `${params[0].axisValue}<br/>`
          params.forEach((item: Record<string, any>) => {
            const value = Number(item.value || 0)

            const color = value > 0
                ? '#f5222d'   // 红
                : value < 0
                    ? '#00a854' // 绿
                    : '#333'

            html += `
              ${item.marker}
              ${item.seriesName}:
              <b style="color:${color}">
                ${value > 0 ? '+' : ''}${value}%
              </b>
              <br/>
            `
          })

          return html
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        axisLine: {
          show: false
        },

        axisTick: {
          show: false
        },

        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },

        axisTick: {
          show: false
        },

        splitLine: {
          show: false
        }
      },
      series
    }

    console.log('option: ', option)
    chart.setOption(option)
    return chart
  }

  useEffect(() => {
    if (!performanceLineChartRef.current && !networthLineChartRef.current) {
      return
    }

    const performanceLineChart = onGetFundPerformanceLineChart()
    const networthLineChart = onGetNetworthLineChart()

    // @ts-ignore
    performanceChartRef.current = performanceLineChart

    // @ts-ignore
    networthChartRef.current = networthLineChart


    return () => {
      performanceLineChart?.dispose()
      networthLineChart?.dispose()
    }
  }, [props.performanceGraph || [], props.networthGraph || []])


  useEffect(() => {
    const handleResize = () => {
      performanceChartRef.current?.resize()
      networthChartRef.current?.resize()
      props.resetSize?.()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const render = () => {
        return (
            <div className="chart w100" style={{ width: props.size?.width || 0, background: 'white' }}>
              <Tabs
                  activeKey={fundPNCurveGraphTabIndex}
                  items={[
                    {
                      key: '0',
                      label: '业绩走势'
                    },
                    {
                      key: '1',
                      label: '净值曲线'
                    }
                  ]}
                  onChange={async tabIndex => {
                    if (tabIndex === fundPNCurveGraphTabIndex) return
                    setFundPNCurveGraphTabIndex(tabIndex)
                    props.onTabChange?.(tabIndex, (props.tabs || []).length > 0 ? props.tabs[Number(tabIndex)].param : '', Number(tabIndex), itemTabIndex)
                  }}
              />

              <div className="flex-align-center mt-2">
                <div className="flex-align-center flex-wrap gap-2.5">
                  {(items || []).map((item: Record<string, any> = {}) => {
                    const active = itemTabIndex === item.value
                    return (
                        <div
                            className={`${active ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                            key={item.value}
                            onClick={async () => {
                              setItemTabIndex(item.value)
                              props.onTabChange?.(item.value, (props.tabs || []).length > 0 ? props.tabs[Number(fundPNCurveGraphTabIndex)].param : '', Number(fundPNCurveGraphTabIndex), item.value)
                            }}
                        >
                          <p className="whitespace-nowrap">{item.label || ''}</p>
                        </div>
                    )
                  })}
                </div>
              </div>

              {
                  fundPNCurveGraphTabIndex === '0' && (
                      <div className="mt-2 flex h100">
                        <div className="flex-1 min-w-0 aspect-square h-full border-right performance-line" style={{
                          height: 500
                        }} ref={performanceLineChartRef}></div>
                      </div>
                  )
              }

              {
                  fundPNCurveGraphTabIndex === '1' && (
                      <div className="mt-2 flex h100">
                        <div className="flex-1 min-w-0 aspect-square h-full border-right networth-line" ref={networthLineChartRef}></div>
                      </div>
                  )
              }
            </div>
        )
    }

    return render()
}

export default observer(MarketDetailFnCurveGraph)