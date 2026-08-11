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
    let list = props.position?.fundPositon?.list || []
    if (list.length > 0) {
      for (let l of list) {
        data.push({
          name: l.text || '',
          value: Number((l.value || '').replace('%', '') || '0.00') || 0.0
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
    let list = props.position?.industryPositon?.list || []
    if (list.length > 0) {
      for (let l of list) {
        data.push({
          label: {
            position: 'right'
          },
          value: Number((l.value || '').replace('%', '') || '0.00') || 0.0
        })

        yAxisData.push(l.text || '')
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

    let xAxisData: Array<string> = []
    let serieBarData = []

    let list = props.position?.fundScale?.list || []
    list = list.flatMap((item: Record<string, any> = {}) => item.info || [])
    list = list.slice(-5)

    if (list.length > 1) {
      xAxisData = list.map((l: Record<string, any> = {}) => l.date || '') || []
      serieBarData = list.map((l: Record<string, any> = {}) => l.value || '') || []
    }

    const chart = echarts.init(scaleBarChartRef.current)
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
      series: [
        {
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
          data: serieBarData || []
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
