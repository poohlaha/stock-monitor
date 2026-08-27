/**
 * @fileOverview 业绩走势 | 净值曲线
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import * as echarts from 'echarts/core'
import { Tabs } from 'antd'

interface IMarketDetailFnCurveGraphProps {
  resetSize: Function
  performanceGraph: Array<Record<string, any>>
  networthGraph: Array<Record<string, any>>
  size: Record<string, any>
  onTabChange: (tabIndex: string, month: string) => void
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
      value: ''
    }
  ]

  const [fundPNCurveGraphTabIndex, setFundPNCurveGraphTabIndex] = useState('ai')
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

    const xAxisData = data.map((d: Record<string, any> = {}) => d.reportDate) || []

    const last = data[data.length - 1] || {}
    const legendMap: Record<string, any> = {
      '单位净值': Number(last?.unitNav || 0),
      '日涨幅': Number(last?.dayChange || 0),
      '累计净值': Number(last?.accumulatedNav || 0)
    }

    const series = [
      {
        name: '单位净值',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          width: 1
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#d6eaff' // 曲线附近浅蓝
              },
              {
                offset: 1,
                color: '#ffffff' // 底部白色
              }
            ]
          }
        },
        data: (data || []).map(d => Number(d.unitNav || '0'))
      },
      {
        name: '日涨幅',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          width: 1,
          opacity: 0
        },
        tooltip: {
          show: false
        },
        data: []
      },
      {
        name: '累计净值',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          width: 1,
          opacity: 0
        },
        tooltip: {
          show: false
        },
        data: []
      }
    ]

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter(params: Record<string, any>) {
          const index = params[0].dataIndex
          const item = data[index]

          let html = `${item.reportDate}<br/>`

          const formatValue = (name: string, value: any, percent = false) => {
            if (value === null || value === undefined || value === '') {
              return ''
            }

            const num = Number(value)

            let color = '#333'

            if (percent) {
              color = num > 0 ? '#f5222d' : num < 0 ? '#00a854' : '#333'
            }

            return `
              <div style="display:flex;justify-content:space-between;min-width:160px;">
                <span>${name}</span>
                <b style="color:${color}">
                  ${percent && num > 0 ? '+' : ''}${num}${percent ? '%' : ''}
                </b>
              </div>
            `
          }

          html += formatValue('单位净值', item.unitNav)
          html += formatValue('日涨幅', item.dayChange, true)
          html += formatValue('累计净值', item.accumulatedNav)
          return html
        }
      },
      legend: {
        left: 0,
        top: 0,
        icon: 'circle',
        itemWidth: 6,
        itemHeight: 6,
        selectedMode: false,
        data: [
          {
            name: '单位净值'
          },
          {
            name: '日涨幅'
          },
          {
            name: '累计净值'
          }
        ],
      },
      formatter(name: string) {
        const value = legendMap[name] || 0
        if (name === '日涨幅') {
          return `${name} ${value > 0 ? '+' : ''}${value}%`
        }

        return `${name} ${value}`
      },
      grid: {
        left: 30,
        right: 50,
        bottom: 30,
        containLabel: true
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
        },
        axisLabel: {
          interval: 0,
          hideOverlap: false,
          formatter(value: any, index: number) {
            return index === 0 || index === xAxisData.length - 1 ? value : ''
          }
        }
      },
      yAxis: {
        show: false,
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

    const xAxisData = data.map((d: Record<string, any> = {}) => d.reportDate) || []

    const lastItem = data[data.length - 1]
    const legendFormatter = (name: string) => {
      let value = '0'

      if (name === '本基金') {
        value = Number(lastItem.fund || 0).toFixed(2)
      }

      if (name === '同类平均') {
        value = Number(lastItem.average || 0).toFixed(2)
      }

      if (name === '沪深300') {
        value = Number(lastItem.index || 0).toFixed(2)
      }

      return `${name}  ${Number(value) > 0 ? '+' : ''}${value}%`
    }

    const series = [
      {
        name: '本基金',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          width: 1
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#d6eaff' // 曲线附近浅蓝
              },
              {
                offset: 1,
                color: '#ffffff' // 底部白色
              }
            ]
          }
        },
        data: data.map(item => Number(item.fund || 0))
      },
      {
        name: '同类平均',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          width: 1,
          opacity: 0
        },
        tooltip: {
          show: false
        },
        data: data.map(item => Number(item.average || 0))
      },
      {
        name: '沪深300',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          width: 1,
          opacity: 0
        },
        tooltip: {
          show: false
        },
        data: data.map(item => Number(item.index || 0))
      }
    ]

    const option = {
      tooltip: {
        trigger: 'axis',

        formatter(params: any[]) {
          const date = params[0].axisValue
          const item = data.find((d: any) => d.reportDate === date)
          if (!item) {
            return date
          }

          const list = [
            {
              name: '本基金',
              value: item.fund
            },
            {
              name: '同类平均',
              value: item.average
            },
            {
              name: '沪深300',
              value: item.index
            }
          ]

          let html = `
              <div>${date}</div>
            `

          list.forEach(row => {
            const value = Number(row.value || 0)
            const color = value > 0 ? '#f5222d' : value < 0 ? '#00a854' : '#333'

            html += `
              <div style="
                display:flex;
                justify-content:space-between;
                width:160px;
              ">
                <span>
                  ${row.name}
                </span>
      
                <b style="color:${color}">
                  ${value > 0 ? '+' : ''}${value}%
                </b>
              </div>
            `
          })

          return html
        }
      },
      legend: {
        show: true,
        left: 10,
        top: 0,
        icon: 'circle',
        itemWidth: 6,
        itemHeight: 6,
        data: [
          '本基金',
          '同类平均',
          '沪深300'
        ],
        selectedMode: false, // 不让点击控制series
        formatter: legendFormatter
      },
      grid: {
        left: 10,
        right: 50,
        bottom: 30,
        containLabel: true
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
        },
        axisLabel: {
          interval: 0,
          hideOverlap: false,
          formatter(value: any, index: number) {
            return index === 0 || index === xAxisData.length - 1 ? value : ''
          }
        }
      },
      yAxis: {
        type: 'value',
        show: false,
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
              key: 'ai',
              label: '业绩走势'
            },
            {
              key: 'nvl',
              label: '净值曲线'
            }
          ]}
          onChange={async tabIndex => {
            if (tabIndex === fundPNCurveGraphTabIndex) return
            setFundPNCurveGraphTabIndex(tabIndex)
            props.onTabChange?.(tabIndex, itemTabIndex)
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
                    props.onTabChange?.(fundPNCurveGraphTabIndex, item.value)
                  }}
                >
                  <p className="whitespace-nowrap">{item.label || ''}</p>
                </div>
              )
            })}
          </div>
        </div>

        {fundPNCurveGraphTabIndex === 'ai' && (
          <div className="mt-2 flex h100">
            <div
              className="flex-1 min-w-0 aspect-square h-full border-right performance-line"
              style={{
                height: 500
              }}
              ref={performanceLineChartRef}
            ></div>
          </div>
        )}

        {fundPNCurveGraphTabIndex === 'nvl' && (
          <div className="mt-2 flex h100">
            <div
              className="flex-1 min-w-0 aspect-square h-full border-right networth-line"
              ref={networthLineChartRef}
            ></div>
          </div>
        )}
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailFnCurveGraph)
