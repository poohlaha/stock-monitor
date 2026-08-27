/**
 * @fileOverview 持仓, 收益, 规模等曲线图
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import * as echarts from 'echarts/core'

interface IMarketDetailCurveGraphProps {
  position: Record<string, any>
  industryList: Array<any>
  allocationList: Array<any>
  historyList: Array<any>
  incomeList: Array<any>
  needIncomeGraph: boolean
  resetSize: Function
}

const MarketDetailCurveGraph = (props: IMarketDetailCurveGraphProps): ReactElement => {
  const positionPieChartRef = useRef(null)
  const positionBarChartRef = useRef(null)
  const incomeBarChartRef = useRef(null)
  const scaleBarChartRef = useRef(null)

  const pieChartRef = useRef<echarts.ECharts | null>(null)
  const barChartRef = useRef<echarts.ECharts | null>(null)
  const incomeChartRef = useRef<echarts.ECharts | null>(null)
  const scaleChartRef = useRef<echarts.ECharts | null>(null)

  // 持仓-资产配置-饼图
  const getPositionPieChart = () => {
    if (!positionPieChartRef.current) return

    let data = []
    let list = props.allocationList || []
    if (list.length > 0) {
      for (let l of list) {
        data.push({
          name: l.assetTypeName || '',
          value: Number(l.proportion || '0.00')
        })
      }
    }

    const chart = echarts.init(positionPieChartRef.current)
    const option = {
      title: {
        text: '资产配置',
        left: 'left'
      },
      tooltip: {
        show: false
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

    let list = props.industryList || []
    const names = list.map(item => item.industryName || '')

    const chart = echarts.init(positionBarChartRef.current)
    const option = {
      title: {
        text: '行业占比',
        left: 'left'
      },
      tooltip: {
        show: false
      },
      xAxis: {
        type: 'value',
        show: false
      },
      grid: {
        left: 10,
        right: 80,
        top: 90,
        bottom: 20
      },
      yAxis: {
        type: 'category',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        inverse: true,
        data: names || []
      },
      series: [
        {
          type: 'custom',
          renderItem(params: any = {}, api: any = {}) {
            const index = params.dataIndex

            const name = list[index].industryName
            const value = api.value(0)

            const coord = api.coord([0, index])
            const width = api.size([value, 0])[0]

            return {
              type: 'group',
              children: [
                {
                  type: 'text',
                  style: {
                    text: name,
                    x: coord[0],
                    y: coord[1] - 25,
                    fontSize: 14,
                    fontWeight: 'bold'
                  }
                },
                {
                  type: 'rect',
                  shape: {
                    x: coord[0],
                    y: coord[1],
                    width,
                    height: 20
                  },
                  style: {
                    fill: '#5470c6'
                  }
                },
                {
                  type: 'text',
                  style: {
                    text: `${value.toFixed(2)}%`,
                    x: coord[0] + width + 8,
                    y: coord[1] + 10,
                    textVerticalAlign: 'middle'
                  }
                }
              ]
            }
          },
          encode: {
            x: 0,
            y: 1
          },
          data: list.map((item, index) => [Number(item.proportion || 0), index])
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

    let list = props.incomeList || []
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

  // 规模变动
  const getScaleBarChart = () => {
    if (!scaleBarChartRef.current) return

    let list = props.historyList || []

    list = list.sort((a: any, b: any) => {
      return Number(a.periodSort || 0) - Number(b.periodSort || 0)
    })

    // 最后展示5个季度
    const showList = list.slice(-5)

    const xAxisData = showList.map((l: Record<string, any>) => l.name || '')

    const seriesBarData = showList.map((l: Record<string, any>) => {
      return Number(l.scale || 0).toFixed(2)
    })

    // 同比: (当前季度规模 - 去年同期规模) / 当前季度规模 * 100
    const seriesLineData = showList.map((item: any) => {
      const currentSort = Number(item.periodSort || 0)

      // 去年同期 = 当前季度 - 100
      const lastYearSort = currentSort - 100
      const lastYearItem = list.find((v: any) => Number(v.periodSort || 0) === lastYearSort)

      let yoy = 0
      if (lastYearItem && Number(item.scale) !== 0) {
        yoy = ((Number(item.scale) - Number(lastYearItem.scale)) / Number(item.scale)) * 100
      }

      return Number(yoy.toFixed(2))
    })

    const chart = echarts.init(scaleBarChartRef.current)
    let option = {
      tooltip: {
        trigger: 'axis',
        formatter(params: any) {
          let html = `<p style="font-weight: bold;">${params[0].axisValue}</p>`

          params.forEach((item: any) => {
            if (item.seriesName === '规模') {
              html += `
                <div style="display:flex;justify-content:space-between;min-width:180px">
                  <span>
                    ${item.marker}
                    资产规模(亿元)
                  </span>
                  <b>${item.value}</b>
                </div>
              `
            }

            if (item.seriesName === '同比') {
              const value = Number(item.value || 0)
              const color = value >= 0 ? '#f5222d' : '#00a854'

              html += `
                <div style="display:flex;justify-content:space-between;min-width:180px">
                  <span>
                    ${item.marker}
                    季度同比
                  </span>
                  <b style="color:${color}">
                    ${value > 0 ? '+' : ''}${value}%
                  </b>
                </div>
              `
            }
          })

          return html
        }
      },
      legend: {
       left: 10,
        top: 0,
        icon: 'circle',
        itemWidth: 6,
        itemHeight: 6,
        selectedMode: false, // 不让点击控制series
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          name: '资产规模(亿元)',
          type: 'bar',
          barWidth: 30,
          barGap: '80%',
          label: {
            show: true,
            position: 'top',
            formatter: (params: Record<string, any> = {}) => {
              return `${params.value}亿元`
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: seriesBarData || []
        },
        {
          name: '同比',
          type: 'line',
          smooth: false,
          showSymbol: false,
          showAllSymbol: false,
          lineStyle: {
            color: '#f5222d',
            width: 1
          },
          itemStyle: {
            color: '#f5222d'
          },
          data: seriesLineData
        }
      ]
    }

    chart.setOption(option)
    return chart
  }

  useEffect(() => {
    if (!positionBarChartRef.current || !positionPieChartRef.current || !scaleBarChartRef.current) {
      return
    }

    const positionPieChart = getPositionPieChart()
    const positionBarChart = getPositionBarChart()
    const incomeBarChart = getIncomeBarChart()
    const scaleBarChart = getScaleBarChart()

    // @ts-ignore
    pieChartRef.current = positionPieChart

    // @ts-ignore
    barChartRef.current = positionBarChart

    // @ts-ignore
    incomeChartRef.current = incomeBarChart

    // @ts-ignore
    scaleChartRef.current = scaleBarChart

    return () => {
      positionPieChart?.dispose()
      positionBarChart?.dispose()
      incomeBarChart?.dispose()
      scaleBarChart?.dispose()
    }
  }, [props.position || {}])

  useEffect(() => {
    const handleResize = () => {
      pieChartRef.current?.resize()
      barChartRef.current?.resize()
      props.resetSize?.()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const render = () => {
    return (
      <div className="mt-4">
        {/* 持仓分布 */}
        <div className="flex-direction-column border rounded-md p-4 w100">
          <p className="text-2xl font-bold">持仓分布</p>
          <div className="mt-2 flex flex-nowrap gap-4 h-96">
            <div className="flex-1 min-w-0 aspect-square h-full border-right" ref={positionPieChartRef}></div>
            <div className="flex-1 min-w-0 aspect-square h-full" ref={positionBarChartRef}></div>
          </div>
        </div>

        {/* 收益率 */}
        {props.needIncomeGraph && (
          <div className="flex-direction-column border rounded-md p-4 w100 mt-4">
            <p className="text-2xl font-bold">收益率</p>
            <div className="mt-2 h-96">
              <div className="aspect-square h-full" ref={incomeBarChartRef}></div>
            </div>
          </div>
        )}

        {/* 规模变动 */}
        <div className="flex-direction-column border rounded-md p-4 w100 mt-4">
          <p className="text-2xl font-bold">规模变动</p>
          <div className="mt-2 h-96">
            <div className="aspect-square h-full" ref={scaleBarChartRef}></div>
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailCurveGraph)
