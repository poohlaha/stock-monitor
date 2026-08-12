/**
 * @fileOverview 股票信息
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Popover, Tabs } from 'antd'
import { useStore } from '@views/stores'
import Utils from '@utils/utils'
import { formatTimestamp, getColor, getRateClassName, isPositive } from '@pages/utils'
import * as echarts from 'echarts/core'
import { useNavigate } from 'react-router-dom'
import RouterUrls from '@route/router.url.toml'

interface IMarketDetailStockProps {
  resetSize: Function
  code: string
  market: string
}

const MarketDetailStock = (props: IMarketDetailStockProps): ReactElement => {
  const { marketStore } = useStore()

  const navigate = useNavigate()

  const [zjlxActiveTabIndex, setZjlxActiveTabIndex] = useState('1')
  const [ccDetalActiveTabIndex, setCcDetailActiveTabIndex] = useState('1')
  // const navigate = useNavigate()

  const getArrowSvg = () => {
    return (
      <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M562.005333 512l-211.2-211.2 60.330667-60.288L682.666667 512l-271.530667 271.530667-60.330667-60.373334 211.2-211.2z"
          fill="currentColor"
        ></path>
      </svg>
    )
  }

  const getQuesitonSvg = () => {
    return (
      <svg className="w-6 h-6 color-gray" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M512 170.666667C324.266667 170.666667 170.666667 324.266667 170.666667 512s153.6 341.333333 341.333333 341.333333 341.333333-153.6 341.333333-341.333333S699.733333 170.666667 512 170.666667z m0 640c-164.266667 0-298.666667-134.4-298.666667-298.666667s134.4-298.666667 298.666667-298.666667 298.666667 134.4 298.666667 298.666667-134.4 298.666667-298.666667 298.666667z"
          fill="#3D3D3D"
          p-id="12800"
        ></path>
        <path
          d="M512 448c-12.8 0-21.333333 8.533333-21.333333 21.333333v213.333334c0 10.666667 8.533333 21.333333 21.333333 21.333333s21.333333-8.533333 21.333333-21.333333V469.333333c0-10.666667-8.533333-21.333333-21.333333-21.333333zM512 320c-12.8 0-21.333333 10.666667-21.333333 21.333333v42.666667c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-10.666667 21.333333-21.333333v-42.666667c0-12.8-8.533333-21.333333-21.333333-21.333333z"
          fill="currentColor"
        ></path>
      </svg>
    )
  }

  const getWidth = (value: number = 0, largest: number = 0) => {
    if (largest === 0) {
      return 0
    }

    return (Math.abs(value) / largest) * 100
  }

  const getTypeItemNode = (type: number = 1, data: Record<string, any> = {}) => {
    const superGrp = data.superGrp || {} // 特大单
    const largeGrp = data.largeGrp || {} // 大单
    const mediumGrp = data.mediumGrp || {} // 中单
    const littleGrp = data.littleGrp || {} // 小单
    const largest = Math.max(
      Math.abs(Number(superGrp.netTurnover || '0')),
      Math.abs(Number(largeGrp.netTurnover || '0')),
      Math.abs(Number(mediumGrp.netTurnover || '0')),
      Math.abs(Number(littleGrp.netTurnover || '0'))
    )

    const items = [
      {
        name: `${type === 2 ? '净' : ''}特大单`,
        value: Number(superGrp.netTurnover || '0'),
        className: getRateClassName(superGrp.netTurnover || 0),
        ...(superGrp || {})
      },
      {
        name: `${type === 2 ? '净' : ''}大单`,
        value: Number(largeGrp.netTurnover || '0'),
        className: getRateClassName(largeGrp.netTurnover || 0),
        ...(largeGrp || {})
      },
      {
        name: `${type === 2 ? '净' : ''}中单`,
        value: Number(mediumGrp.netTurnover || '0'),
        className: getRateClassName(mediumGrp.netTurnover || 0),
        ...(mediumGrp || {})
      },
      {
        name: `${type === 2 ? '净' : ''}小单`,
        value: Number(littleGrp.netTurnover || '0'),
        className: getRateClassName(littleGrp.netTurnover || 0),
        ...(littleGrp || {})
      }
    ]

    return (
      <>
        <div className="color-gray flex-align-center">
          <p className="flex-1 text-l">类别</p>
          <p className="flex-1"></p>
          <p className={`flex-1 ${type === 1 ? 'text-c' : 'text-r'}`}>净流入</p>
          {type === 1 && (
            <>
              <p className="flex-1 text-c">流入</p>
              <p className="flex-1 text-r">流出</p>
            </>
          )}
        </div>

        {items.map((l: Record<string, any> = {}, index: number) => {
          const width = getWidth(l.value, largest)
          return (
            <div className="flex-align-center h-12 border-bottom" key={index}>
              <p className="pr-1 flex-1 text-l">{l.name}</p>
              <div className="flex-1 h-4 pr-4">
                {width === 0 ? (
                  <p
                    className="rounded-md max-w-[200px] h-4"
                    style={{
                      backgroundColor: '#f5f6fa'
                    }}
                  ></p>
                ) : (
                  <p
                    className={`${l.value > 0 ? 'bg-red-600' : 'bg-emerald-700'} rounded-md max-w-[200px] h-4`}
                    style={{
                      width: `${width}%`
                    }}
                  ></p>
                )}
              </div>
              <p
                className={`flex-1 ${getRateClassName(l.netTurnover || 0)} pr-1 font-bold ${type === 1 ? 'text-c' : 'text-r'}`}
              >
                {l.netTurnover || 0}
              </p>
              {type === 1 && (
                <>
                  <p className="flex-1 pr-1 text-c">{l.turnoverIn || 0}</p>
                  <p className="flex-1 pr-1 text-r">{l.turnoverOut || 0}</p>
                </>
              )}
            </div>
          )
        })}
      </>
    )
  }

  const getIndustryFundFlowTabChildren = (data: Record<string, any> = {}) => {
    const todayMainFlow = data.todayMainFlow || {}
    const titleLabel = Number(todayMainFlow.mainNetIn) > 0 ? '流入' : '流出'
    const recentList = data.recently || []

    return (
      <div className="flex-direction-column">
        <div className="flex-align-center">
          <div className="flex-align-center flex-1">
            <div className="">主力净{titleLabel}总计</div>
            <p className={`ml-4 ${getRateClassName(todayMainFlow.mainNetIn || 0)}`}>{todayMainFlow.mainNetIn || 0}</p>
          </div>

          <div className="flex-align-center">
            <p className="mr-1">行业排行</p>

            <div className="w-4 h-4">{getArrowSvg()}</div>
          </div>
        </div>

        <div className="flex-direction-column mt-2">
          {getTypeItemNode(1, data)}

          <div className="mt-2 w100 flex-align-center">
            {(recentList || []).map((recent: Record<string, any> = {}, index: number) => {
              return (
                <div className="flex-direction-column flex-1 pr-1" key={index}>
                  <p>{recent.key || ''}</p>
                  <p className={`${getRateClassName(recent.value || '0')} mt-1 font-bold`}>{recent.value || ''}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const getIndustryFundFlowTabItems = () => {
    if (Utils.isObjectNull(marketStore.industryFundFlow || {})) {
      return []
    }

    const result = (marketStore.industryFundFlow.fundFlowBlock || {}).result || []
    if (result.length === 0) {
      return []
    }

    const items = []
    for (let i = 0; i < result.length; i++) {
      const r = result[i] || {}
      const industry = r.industry || {}
      if (Utils.isObjectNull(industry)) {
        continue
      }

      items.push({
        key: `${i}`,
        label: `${industry.name}(${industry.desc})`,
        children: getIndustryFundFlowTabChildren(r)
      })
    }

    return items
  }

  // 资金分布
  const getZJFBNode = () => {
    const result = ((marketStore.industryFundFlow || {}).fundFlowSpread || {}).result || {}
    const analysis = result.analysis || {}

    const superGrp = result.superGrp || {} // 特大单
    const largeGrp = result.largeGrp || {} // 大单
    const mediumGrp = result.mediumGrp || {} // 中单
    const littleGrp = result.littleGrp || {} // 小单

    const inItems = [
      {
        label: '特',
        backgroundColor: 'rgb(214, 10, 34)',
        color: 'rgb(214, 10, 34)',
        ...(superGrp || {})
      },
      {
        label: '大',
        backgroundColor: 'rgb(227, 57, 77)',
        color: 'rgb(217, 48, 62)',
        ...(largeGrp || {})
      },
      {
        label: '中',
        backgroundColor: 'rgb(240, 108, 123)',
        color: 'rgb(242, 54, 69)',
        ...(mediumGrp || {})
      },
      {
        label: '小',
        backgroundColor: 'rgb(252, 164, 174)',
        color: 'rgb(242, 77, 91)',
        ...(littleGrp || {})
      }
    ]

    const outItems = [
      {
        label: '特',
        backgroundColor: 'rgb(3, 123, 102)',
        color: 'rgb(3, 123, 102)',
        ...(superGrp || {})
      },
      {
        label: '大',
        backgroundColor: 'rgb(19, 148, 126)',
        color: 'rgb(7, 128, 108)',
        ...(largeGrp || {})
      },
      {
        label: '中',
        backgroundColor: 'rgb(40, 173, 150)',
        color: 'rgb(8, 153, 129)',
        ...(mediumGrp || {})
      },
      {
        label: '小',
        backgroundColor: 'rgb(66, 199, 176)',
        color: 'rgb(9, 178, 150)',
        ...(littleGrp || {})
      }
    ]

    return (
      <div className="flex-direction-column flex-1 border rounded-lg p-4">
        <div className="flex-align-center flex-jsc-between">
          <div className="flex-align-center pr-2">
            <p className="font-bold text-xl mr-1">资金分布</p>
            <Popover
              trigger={['hover']}
              classNames={{
                root: 'm-table-sortable-popover'
              }}
              placement="bottomRight"
              arrow={false}
              content={
                <div className="flex-direction-column">
                  <p>
                    将历史逐笔成交数据按照订单之间一定的大小数量级关系计算阈值，按阈值划分为特大单、大单、中单、小单。
                  </p>
                  <p className="text-xs color-gray">特此说明：此功能仅提供客观统计结果，不构成任何投资建议。</p>
                </div>
              }
            >
              {getQuesitonSvg()}
            </Popover>
            {!Utils.isObjectNull(result || {}) && <p className="ml-4 color-gray">单位：亿</p>}
          </div>

          {!Utils.isObjectNull(result || {}) && (
            <div className="flex-align-center">
              <p>更新时间: </p>
              <p className="ml-1">{result.updateTime || '-'}</p>
            </div>
          )}
        </div>

        {Utils.isObjectNull(result || {}) ? (
          <div className="flex-center h100">
            <p className="color-gray">暂无数据</p>
          </div>
        ) : (
          <div className="flex-direction-column">
            {(analysis.list || []).length > 0 && (
              <div className="flex-direction-column w100 mt-4">
                <div className="flex-align-center w100">
                  {(analysis.list || []).map((l: Record<string, any> = {}, index: number) => {
                    return (
                      <div
                        className={`flex-jsc-between flex-1 ${index !== (analysis.list || []).length - 1 ? 'pr-4' : ''}`}
                        key={index}
                      >
                        <p>{l.desc || ''}</p>
                        <div className="flex-align-center">
                          <p className={`${index === (analysis.list || []).length - 1 ? 'theme-color' : ''}`}>
                            {l.content || '-'}
                          </p>
                          {index === (analysis.list || []).length - 1 && (
                            <div className="w-4 h-4 theme-color ml-1">{getArrowSvg()}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 公告 */}
            {!Utils.isBlank(analysis.content || '') && (
              <div className="p-2 notice rounded-md mt-2">
                <p>{analysis.content || ''}</p>
              </div>
            )}

            <div className="mt-2 flex-direction-column">
              <div className="flex-align-center pt-2 pb-2 flex-jsc-between">
                <div className="flex-align-center">
                  <p>流入</p>
                  <p className="ml-2">{result.turnoverInTotal || '-'}</p>
                </div>

                <div className="flex-align-center">
                  <p>流出</p>
                  <p className="ml-2">{result.turnoverOutTotal || '-'}</p>
                </div>
              </div>

              {/* 资金明细图 */}
              <div className="flex-align-center pt-2 pb-2 flex-jsc-between">
                {/* 流入 */}
                <div className="flex-direction-column pr-4 flex-1">
                  {inItems.map((item: Record<string, any> = {}, index: number) => {
                    return (
                      <div className="h-8 flex-align-center flex-jsc-between" key={index}>
                        <div className="flex-align-center pr-2">
                          <div
                            className="rounded-md p-0.5 text-white"
                            style={{ background: item.backgroundColor || '' }}
                          >
                            {item.label || ''}
                          </div>
                          <p className="ml-2" style={{ color: item.color || '' }}>
                            {item.turnoverIn || '0'}
                          </p>
                        </div>

                        <p className="flex-align-center pl-2">{item.turnoverInRate || '-'}</p>
                      </div>
                    )
                  })}
                </div>

                {/* 流出 */}
                <div className="flex-direction-column pl-4 flex-1">
                  {outItems.map((item: Record<string, any> = {}, index: number) => {
                    return (
                      <div className="h-8 flex-align-center flex-jsc-between" key={index}>
                        <div className="flex-align-center pr-2">
                          <div
                            className="rounded-md p-0.5 text-white"
                            style={{ background: item.backgroundColor || '' }}
                          >
                            {item.label || ''}
                          </div>
                          <p className="ml-2" style={{ color: item.color || '' }}>
                            {item.turnoverOut || '0'}
                          </p>
                        </div>

                        <p className="flex-align-center pl-2">{item.turnoverOutRate || '-'}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 今日主力流向
  const getTodayZLLXNode = () => {
    const result = ((marketStore.industryFundFlow || {}).fundFlowSpread || {}).result || {}
    const todayMainFlow = result.todayMainFlow || {}
    return (
      <div className="flex-direction-column flex-1  border rounded-lg p-4">
        <div className="flex-align-center pr-2 flex-jsc-between">
          <p className="font-bold text-xl mr-1">今日主力流向</p>
          {!Utils.isObjectNull(todayMainFlow || {}) && <p className="color-gray">单位：亿</p>}
        </div>

        <div className="flex-direction-column mt-4">
          <div className="flex-align-center">
            <div className="flex-1 pr-4 flex-align-center flex-jsc-between">
              <p className="color-gray">主力流入</p>
              <p>{todayMainFlow.mainIn || '-'}</p>
            </div>
            <div className="flex-1 pl-4 flex-align-center flex-jsc-between">
              <p className="color-gray">主力流出</p>
              <p>{todayMainFlow.mainOut || '-'}</p>
            </div>

            <div className="flex-1 pl-4 flex-align-center flex-jsc-between">
              <p className="color-gray">主力净流出</p>
              <p className={`${getRateClassName(todayMainFlow.mainNetIn || '-')}`}>{todayMainFlow.mainNetIn || '-'}</p>
            </div>
          </div>

          <div className="mt-4">{getTypeItemNode(2, result || {})}</div>
        </div>
      </div>
    )
  }

  const zjlxMinuteLineChartRef = useRef(null)
  const zjlxMinutChartRef = useRef<echarts.ECharts | null>(null)

  const zjlxOtherLineChartRef = useRef(null)
  const zjlxOtherChartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!zjlxMinuteLineChartRef.current && !zjlxOtherLineChartRef.current) {
      return
    }

    const zjlxMinuteLineLineChart = onGetZjlxMinuteLineChart()

    const zjlxOtherLineLineChart = onGetZjlxOtherLineChart()

    // @ts-ignore
    zjlxMinutChartRef.current = zjlxMinuteLineLineChart

    // @ts-ignore
    zjlxOtherChartRef.current = zjlxOtherLineLineChart

    return () => {
      zjlxMinuteLineLineChart?.dispose()
      zjlxOtherLineLineChart?.dispose()
    }
  }, [
    (marketStore.industryFundFlow || {}).fundFlowMinute || {},
    (marketStore.industryOtherFundFlow || {}).fundFlowDay || {}
  ])

  useEffect(() => {
    const handleResize = () => {
      zjlxMinutChartRef.current?.resize()
      zjlxOtherChartRef.current?.resize()
      props.resetSize?.()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 资金流向-实时
  const onGetZjlxMinuteLineChart = () => {
    const result = (marketStore.industryFundFlow || {}).fundFlowMinute || {}
    if (!zjlxMinuteLineChartRef.current || Utils.isObjectNull(result || {})) {
      return
    }

    const chart = echarts.init(zjlxMinuteLineChartRef.current)

    const data = result.data || ''
    const rows = data
      .split(';')
      .filter(Boolean)
      .map((item: Record<string, any> = {}) => {
        const arr = item.split(',')

        let obj: Record<string, any> = {}
        result.headers.forEach((_: string, index: number) => {
          obj[index] = arr[index]
        })

        return obj
      })

    const xAxisData = rows.map((item: Record<number, any>) => {
      return item[0].split(' ')[1]
    })

    const ignoreIndex = [0, 9]

    const legendData = (result.headers || []).filter((_: string, index: number) => {
      return !ignoreIndex.includes(index)
    })

    const series = (result.headers || [])
      .map((name: string = '', index: number) => {
        if (ignoreIndex.includes(index)) {
          return null
        }

        return {
          name,
          type: 'line',
          symbol: 'none',
          data: rows.map((item: Record<string, any> = {}) => Number(item[index]))
        }
      })
      .filter(Boolean)

    const defaultSelected: Record<string, boolean> = {}
    result.headers.forEach((name: string) => {
      defaultSelected[name] = ['主力', '特大单'].includes(name)
    })

    const option = {
      legend: {
        data: legendData,
        selected: defaultSelected
      },
      grid: {
        left: 30,
        right: 40,
        top: 20,
        bottom: 10,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        formatter(params: any[]) {
          const index = params[0].dataIndex
          const row = rows[index] || {}
          const values: Array<string> = Object.values(row || {})
          const value = (values[values.length - 1] || '0').replace('%', '')
          const ratio = Number(value)
          const ratioColor = getColor(ratio)

          const param = params.find((p: Record<string, any> = {}) => p.seriesName === '股价') || {}
          const hasGJ = !Utils.isObjectNull(param || {})

          let html = `
            <div>
             <div>${params[0].axisValue}</div>
             `
          params.forEach(item => {
            const value = Number(item.value)
            const color = getColor(value)

            html += `
                  <div style="
                    display:flex;
                    justify-content:space-between;
                    min-width:180px;
                    gap:20px;
                  ">
                    <span>
                      <span style="
                        display:inline-block;
                        width:8px;
                        height:8px;
                        border-radius:50%;
                        background:${item.color};
                        margin-right:6px;
                      "></span>
                      ${item.seriesName}
                    </span>
          
                    <span style="color:${color}">
                      ${value.toFixed(2)}
                    </span>
                  </div>
                `
          })

          if (hasGJ) {
            html += `
            <div style="
              display:flex;
              justify-content:space-between;
              min-width:180px;
              gap:20px;
            ">
              <span>涨跌幅</span>
              <span style="color:${ratioColor}">
                ${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%
              </span>
            </div>
          `
          }

          html += '</div>'

          return html
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval(index: number) {
            const value = xAxisData[index]
            return ['09:30', '11:30', '15:00'].includes(value)
          },
          formatter(value: string) {
            const showTimes: Record<string, string> = {
              '09:30': '09:30',
              '11:30': '11:30/13:30',
              '15:00': '15:00'
            }

            return showTimes[value] || ''
          }
        },
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

  // 资金流向-日|周|月
  const onGetZjlxOtherLineChart = () => {
    let name = 'fundFlowDay'
    if (zjlxActiveTabIndex === '3') {
      name = 'fundFlowWeek'
    } else if (zjlxActiveTabIndex === '4') {
      name = 'fundFlowMonth'
    }

    const result = ((marketStore.industryOtherFundFlow || {})[name] || {}).result || {}
    if (!zjlxOtherLineChartRef.current || Utils.isObjectNull(result || {})) {
      return
    }

    const chart = echarts.init(zjlxOtherLineChartRef.current)
    const main = result.main || [] // 主力
    const retail = result.retail || [] // 散户

    const xAxisData = main.map((m: Record<string, any> = {}) => m.date || '') || []
    const series = []

    const mainData = []
    const retailData = []
    for (let m of main) {
      mainData.push(Number(m.netTurnover || '0'))
    }

    for (let r of retail) {
      retailData.push(Number(r.netTurnover || '0'))
    }

    const labels = ['主力', '散户']

    series.push({
      name: labels[0] || '',
      type: 'bar',
      barGap: 0,
      barWidth: 15,
      data: mainData,
      itemStyle: {
        color(params: any) {
          return getColor(params.value || '0')
        }
      }
    })

    series.push({
      name: labels[1] || '',
      type: 'bar',
      barGap: 0,
      barWidth: 15,
      data: retailData,
      itemStyle: {
        color(params: any) {
          return getColor(params.value || '0')
        }
      }
    })

    let option = {
      tooltip: {
        trigger: 'axis',
        formatter(params: any[]) {
          let html = `${params[0].axisValue}<br/>`

          params.forEach(item => {
            const value = Number(item.value || 0)
            const color = getColor(value)

            html += `
              <div style="display:flex;justify-content:space-between;min-width:180px;">
                <span>
                  ${item.marker}
                  ${item.seriesName}
                </span>
                <span style="color:${color};text-align:right;">
                  ${value}
                </span>
              </div>
            `
          })

          return html
        }
      },
      legend: {
        data: labels
      },
      grid: {
        left: 30,
        right: 40,
        top: 20,
        bottom: 10,
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
        axisLabel: {
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

  // 资金流向
  const getZJLXNode = () => {
    return (
      <div className="flex-direction-column flex-1 border rounded-lg p-4">
        <p className="font-bold text-xl">资金流向</p>
        <Tabs
          activeKey={zjlxActiveTabIndex}
          items={[
            {
              label: '实时',
              key: '1'
            },
            {
              label: '日',
              key: '2'
            },
            {
              label: '周',
              key: '3'
            },
            {
              label: '月',
              key: '4'
            }
          ]}
          onChange={async tabIndex => {
            if (tabIndex === zjlxActiveTabIndex) return
            setZjlxActiveTabIndex(tabIndex)
            let flowType = ''
            if (tabIndex === '2') {
              flowType = 'day'
            } else if (tabIndex === '3') {
              flowType = 'week'
            } else if (tabIndex === '4') {
              flowType = 'month'
            }

            await marketStore.onGetIndustryFundFlow(
              props.code || '',
              props.market || '',
              flowType || '',
              tabIndex || '1'
            )
          }}
        />

        {zjlxActiveTabIndex === '1' && (
          <div
            className="flex-1 h100 min-w-0 aspect-square border-right performance-line"
            style={{
              height: 500
            }}
            ref={zjlxMinuteLineChartRef}
          />
        )}

        {(zjlxActiveTabIndex === '2' || zjlxActiveTabIndex === '3' || zjlxActiveTabIndex === '4') && (
          <div
            className="flex-1 min-w-0 aspect-square h-full border-right performance-line"
            style={{
              height: 500
            }}
            ref={zjlxOtherLineChartRef}
          />
        )}
      </div>
    )
  }

  const getCompanyProfile = () => {
    const newCompany = (marketStore.companyProfile || {}).newCompany || {}
    const basicInfo = newCompany.basicInfo || {}
    const industry = basicInfo.industry || {}
    const area = basicInfo.area || []
    const concepts = basicInfo.concepts || []
    return (
      <div className="info flex-direction-column flex-1 border rounded-lg p-4">
        <p className="font-bold text-xl">基本信息</p>

        <div className="flex-direction-column mt-4">
          <div className="flex-align-start">
            <p className="font-bold shrink-0">公司简介: </p>
            <Popover
              trigger={['hover']}
              classNames={{
                root: 'm-table-sortable-popover'
              }}
              placement="bottomRight"
              arrow={false}
              content={<p>{basicInfo.mainBusiness || ''}</p>}
            >
              <div className="overflow-hidden over-two-ellipsis ml-2">{basicInfo.mainBusiness || ''}</div>
            </Popover>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">公司名称: </p>
            <div className="ml-2">{basicInfo.companyName || ''}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">所属行业: </p>
            <div className="ml-2">{industry.length > 0 ? industry[0].text || '' : '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">上市日期: </p>
            <div className="ml-2">{basicInfo.releaseDate || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">发行数量: </p>
            <div className="ml-2">{basicInfo.issueNumber || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">发行价格: </p>
            <div className="ml-2">{basicInfo.issuePrice || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">所在地区: </p>
            <div className="ml-2">{area.length > 0 ? area[0].text || '' : '-'}</div>
          </div>

          <div className="flex-align-start mt-2">
            <p className="font-bold shrink-0">所属概念: </p>
            <div className="ml-2 flex-1 flex-align-center flex-wrap">
              {concepts.map((concept: Record<string, any> = {}, index: number) => {
                return (
                  <p className="mr-2 mb-2 notice pt-1 pb-1 pl-2 pr-2 shrink-0" key={index}>
                    {concept.text || ''}
                  </p>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 机构评级
  const getInstitutionalRatings = () => {
    const organRating = marketStore.companyProfile?.newCompany?.organRating || {}
    const issuingAgency = organRating.body || []

    const largest = Math.max(
      Math.abs(Number(organRating.curPrice || '0')),
      Math.abs(Number(organRating.avgPrice || '0')),
      Math.abs(Number(organRating.maxPrice || '0')),
      Math.abs(Number(organRating.minPrice || '0'))
    )

    const items = [
      {
        name: '当前价',
        value: Number(organRating.curPrice || '0'),
        width: getWidth(Number(organRating.curPrice || '0'), largest),
        backgroundColor: 'rgb(78, 110, 242)',
        opacity: 1
      },
      {
        name: '目标均价',
        value: Number(organRating.avgPrice || '0'),
        width: getWidth(Number(organRating.avgPrice || '0'), largest),
        backgroundColor: 'rgb(78, 110, 242)',
        opacity: 0.5
      },
      {
        name: '目标最高价',
        value: Number(organRating.maxPrice || '0'),
        width: getWidth(Number(organRating.maxPrice || '0'), largest),
        backgroundColor: 'rgb(78, 110, 242)',
        opacity: 0.5
      },
      {
        name: '目标最低价',
        value: Number(organRating.minPrice || '0'),
        width: getWidth(Number(organRating.minPrice || '0'), largest),
        backgroundColor: 'rgb(78, 110, 242)',
        opacity: 0.5
      }
    ]

    return (
      <div className="info flex-direction-column flex-1 border rounded-lg p-4 h100">
        <div className="flex-align-center">
          <p className="font-bold text-xl mr-2">机构评级</p>
          <Popover
            trigger={['hover']}
            classNames={{
              root: 'm-table-sortable-popover'
            }}
            placement="bottomRight"
            arrow={false}
            content={<p>目前有{organRating.organNum || 0}家机构对目标进行预测</p>}
          >
            {getQuesitonSvg()}
          </Popover>
        </div>

        <div className="mt-4 flex flex-col lg:flex-row gap-5 h-[300px]">
          {/* 机构预测 */}
          <div className="flex-direction-column flex-1">
            <p className="font-bold text-base mr-2">机构预测</p>
            <div className="flex-direction-column color-gray mt-2">
              <div className="flex-align-center">
                <p className="flex-1 text-l pl-2">名称</p>
                <p className="flex-1"></p>
                <p className="flex-1 text-r pr-2">价格</p>
              </div>
            </div>

            <div className="flex-direction-column mt-2">
              {items.map((item: Record<string, any> = {}, index: number) => {
                return (
                  <div
                    className="flex-1 h-12 border-bottom bg-line-hover flex-align-center min-h-12 hover:rounded-md"
                    key={index}
                  >
                    <p className="flex-1 text-l pl-2">{item.name || ''}</p>
                    <p
                      className="rounded-md max-w-[200px] h-4 flex-1"
                      style={{
                        width: `${item.width}%`,
                        backgroundColor: item.backgroundColor || '',
                        opacity: item.opacity
                      }}
                    />
                    <p className="flex-1 text-r pr-2">{organRating.curPrice || '0'}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 发布机构 */}
          <div className="flex-direction-column flex-1">
            <p className="font-bold text-base mr-2">发布机构</p>
            <div className="flex-direction-column color-gray mt-2">
              <div className="flex-align-center">
                <p className="flex-1 text-l pl-2">机构</p>
                <p className="flex-1 text-c">发布日期</p>
                <p className="flex-1 text-r pr-2">评级/目标价</p>
              </div>
            </div>

            <div className="flex-direction-column mt-2 overflow-y-auto no-scrollbar">
              {(issuingAgency || []).map((item: Record<string, any> = {}, index: number) => {
                return (
                  <div
                    className="flex-1 h-12 border-bottom bg-line-hover flex-align-center min-h-12 hover:rounded-md"
                    key={index}
                  >
                    <p className="flex-1 text-l pl-2">{item.organ || '-'}</p>
                    <p className="flex-1 text-c">{item.date || '-'}</p>
                    <p className="flex-1 text-r pr-2">
                      {item.rating || ''}
                      {item.price || '-'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const splitMoney = (str: string = '') => {
    let value = ''
    if (!Utils.isBlank(str || '')) {
      const strs = str.split('$$$') || []
      if (strs.length > 0) {
        value = strs[0] || ''
      }
    }

    return value
  }

  // 高管预览
  const getExecutiveOverview = () => {
    const executiveList = (marketStore.executiveChanges?.executiveInfo || {}).body || []
    const bonusTransferList = (marketStore.executiveChanges?.bonusTransfer || {}).body || []
    return (
      <div className="flex-direction-column flex-1 border rounded-lg p-4 h100">
        <p className="font-bold text-lg mr-2">高管概览</p>

        <div className="mt-4 flex flex-col lg:flex-row gap-5 h-[300px]">
          {/* 高管信息 */}
          <div className="flex-direction-column flex-1">
            <p className="font-bold text-base mr-2">高管信息</p>
            <div className="flex-direction-column color-gray mt-2">
              <div className="flex-align-center">
                <p className="flex-1 text-l pl-2">高管</p>
                <p className="flex-2 pr-2 text-r">职务</p>
                <p className="flex-1 text-r pr-2">持股(股)</p>
              </div>
            </div>

            <div className="flex-direction-column mt-2 overflow-y-auto no-scrollbar">
              {executiveList.map((item: Array<string> = [], index: number) => {
                return (
                  <div
                    className="flex-1 pt-2 pb-2 border-bottom bg-line-hover flex-align-center min-h-12 hover:rounded-md"
                    key={index}
                  >
                    <p className="flex-1 text-l pl-2">{item[0] || ''}</p>
                    <p className="flex-2 pr-2 text-r">{(item || []).length >= 1 ? item[1] : ''}</p>
                    <p className="flex-1 text-r pr-2">{(item || []).length >= 3 ? item[3] : ''}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 高管增减持 */}
          <div className="flex-direction-column flex-1">
            <p className="font-bold text-base mr-2">高管增减持</p>
            <div className="flex-direction-column color-gray mt-2">
              <div className="flex-align-center">
                <p className="flex-1 text-l pl-2">高管</p>
                <p className="flex-1 text-c">持股变动(股)</p>
                <p className="flex-1 text-r pr-2">变动日期</p>
              </div>
            </div>

            <div className="flex-direction-column mt-2 overflow-y-auto no-scrollbar">
              {(bonusTransferList || []).map((item: Array<string> = [], index: number) => {
                let value = ''
                if (item.length >= 2) {
                  value = splitMoney(item[2] || '')
                }

                return (
                  <div
                    className="flex-1 h-12 border-bottom bg-line-hover flex-align-center min-h-12 hover:rounded-md"
                    key={index}
                  >
                    <p className="flex-1 text-l pl-2">{item[0] || ''}</p>
                    <p className={`flex-1 pr-2 text-c font-bold ${getRateClassName(value || '-')}`}>{value || '-'}</p>
                    <p className="flex-1 text-r pr-2">{(item || []).length >= 1 ? item[1] : ''}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 分红转送
  const getDividendsTransfer = () => {
    const newCompany = (marketStore.companyProfile || {}).newCompany || {}
    const body = (newCompany.bonusTransfer || {}).body || []
    const header = (newCompany.bonusTransfer || {}).header || []

    return (
      <div className="flex-direction-column flex-1 border rounded-lg p-4">
        <p className="font-bold text-lg mr-2">分红转送</p>
        <div className="flex-direction-column color-gray mt-2">
          <div className="flex-align-center">
            {header.map((h: string = '', index: number) => {
              return (
                <p className={`flex-1 pl-2 ${index === 0 ? 'text-l' : 'text-r'}`} key={index}>
                  {h}
                </p>
              )
            })}
          </div>

          <div className="flex-direction-column mt-2 overflow-y-auto no-scrollbar h-[300px]">
            {body.map((b: Array<string> = [], index: number) => {
              if (b.length === 0) {
                return null
              }

              return (
                <div
                  className="flex-align-center border-bottom bg-line-hover flex-align-center min-h-12 hover:rounded-md p-2"
                  key={index}
                >
                  {b.map((bb: string = '', i: number) => {
                    if (i >= header.length) {
                      return null
                    }
                    return (
                      <p className={`flex-1 pl-2 ${i === 0 ? 'text-l' : 'text-r'}`} key={`${index}_${i}`}>
                        {bb || ''}
                      </p>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const getNews = () => {
    return (
      <div className="news-list flex-direction-column flex-1 border rounded-lg p-4 mt-8">
        <p className="font-bold text-xl">相关新闻</p>
        <div className="flex-direction-column mt-4">
          {(marketStore.newsList || []).length === 0 && (
            <div className="wh100 flex-center min-h-[300px] h-[300px]">
              <p className="color-gray">暂无数据</p>
            </div>
          )}

          {(marketStore.newsList || []).length > 0 &&
            marketStore.newsList.map((l: Record<string, any> = {}, index) => {
              return (
                <div
                  className={`flex-direction-column rounded-md bg-line-hover cursor-pointer p-2 ${index !== marketStore.newsList.length - 1 ? 'mb-4' : ''}`}
                  key={index}
                >
                  <div className="color-gray flex-align-center">
                    <p>{l.provider || ''}</p>
                    <p className="ml-2">{formatTimestamp(Number(l.publishTime || '0'))}</p>
                  </div>
                  <div className="mt-1">
                    <p
                      className="font-bold text-base"
                      onClick={() => {
                        navigate(
                          `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.NEWS.URL}?url=${encodeURIComponent(l.originUrl || '')}`
                        )
                      }}
                    >
                      {l.title || ''}
                    </p>
                    <p className="mt-1 over-two-ellipsis overflow-hidden">{l.abstract || ''}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  // 股本股东
  const getShareholders = () => {
    const shareholderEquity = (marketStore.companyProfile.newCompany || {}).shareholderEquity || {}
    const equityChange = marketStore.shareholders?.equityChange || {}
    const body = equityChange.list || []

    return (
      <div className="flex-direction-column flex-1 border rounded-lg p-4 mt-8">
        <p className="font-bold text-xl">{shareholderEquity.title || ''}</p>

        <div className="flex-direction-column mt-4">
          <p className="font-bold text-base">{equityChange.title || ''}</p>
          <div className="flex-direction-column color-gray mt-2">
            <div className="flex-align-center">
              <p className="flex-1 text-l pl-2">变动日期</p>
              <p className="flex-1 text-c">总股本(变动)</p>
              <p className="flex-1 text-r pr-2">流动股(变动)</p>
            </div>
          </div>

          <div className="flex-direction-column mt-2 overflow-y-auto no-scrollbar h-[300px]">
            {body.map((b: Record<string, any> = {}, index: number) => {
              const bb = b.body || []

              const bb1 = bb.length > 0 ? bb[0] || [] : []
              const bb2 = bb.length > 1 ? bb[1] || [] : []

              let value1 = ''
              let value1ClassName = ''
              if (bb1.length >= 2) {
                value1 = splitMoney(bb1[2] || '')
                value1ClassName = value1 !== '未变' ? getRateClassName(isPositive(value1) ? 1 : -1) : ''
              }

              let value2 = ''
              let value2ClassName = ''
              if (bb2.length >= 2) {
                value2 = splitMoney(bb2[2] || '')
                value2ClassName = value2 !== '未变' ? getRateClassName(isPositive(value2) ? 1 : -1) : ''
              }

              return (
                <div
                  className="flex-align-center border-bottom bg-line-hover flex-align-center min-h-12 hover:rounded-md p-2"
                  key={index}
                >
                  <p className="flex-1 text-l pl-2">{b.reportDate || ''}</p>
                  <div className="flex-1 text-c flex-center">
                    <p>{bb1.length >= 1 ? bb1[1] : ''}</p>
                    <p className={`font-bold ${value1ClassName}`}>({value1})</p>
                  </div>
                  <div className="flex-1 text-r pr-2 flex items-end justify-end">
                    <p>{bb2.length >= 1 ? bb1[1] : ''}</p>
                    <p className={`font-bold ${value2ClassName}`}>({value2})</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // 持仓明细
  const getPositionDetails = () => {
    const holdShareInfo = marketStore.holdShareInfo || {}
    const tabs = holdShareInfo.tabs || []

    const getItemChildren = (data: Array<Record<string, any>> = []) => {
      return (
        <div className="flex-direction-column">
          <div className="flex-direction-column color-gray mt-2">
            <div className="flex-align-center">
              <p className="flex-1 text-l pl-2">股东名称</p>
              <p className="flex-1 text-r">持股数量</p>
              <p className="flex-1 text-r pr-2">变动比例</p>
              <p className="flex-1 text-r pr-2">较上期变动</p>
            </div>
          </div>

          <div className="flex-direction-column mt-2 overflow-y-auto no-scrollbar h-[300px]">
            {(data || []).map((d: Record<string, any> = {}, index: number) => {
              let className = ''
              if ((d.holdChange || '').startsWith('增')) {
                className = 'red'
              } else if ((d.holdChange || '').startsWith('减')) {
                className = 'green'
              }
              return (
                <div
                  className="flex-align-center border-bottom bg-line-hover flex-align-center min-h-12 hover:rounded-md p-2"
                  key={index}
                >
                  <p className="flex-1 text-l pl-2">{d.holder || ''}</p>
                  <p className="flex-1 text-r pl-2">{d.holdNum || ''}</p>
                  <p className="flex-1 text-r pl-2">{d.holdPer || ''}</p>
                  <p className={`flex-1 text-r pl-2 ${className || ''}`}>{d.holdChange || ''}</p>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    const getItems = () => {
      let arr = []
      for (let tab of tabs) {
        arr.push({
          label: tab.name || '',
          key: tab.params?.hold_type || '',
          children: getItemChildren(holdShareInfo.content?.body || [])
        })
      }

      return arr
    }

    return (
      <div className="flex-direction-column flex-1 border rounded-lg p-4 mt-8">
        <p className="font-bold text-xl">{holdShareInfo.title || ''}</p>

        <Tabs
          items={getItems()}
          onChange={async tabIndex => {
            if (tabIndex === ccDetalActiveTabIndex) return
            setCcDetailActiveTabIndex(tabIndex)
            const basicInfo = (marketStore.companyProfile.newCompany || {}).basicInfo || {}
            await marketStore.onGetExecutiveChanges(
              props.code || '',
              props.market || '',
              basicInfo.companyCode || '',
              basicInfo.innerCode || '',
              'holder_equity_detail',
              tabIndex,
              (d: Record<string, any> = {}) => {
                marketStore.holdShareInfo = d || {}
                console.log('holdShare info: ', marketStore.holdShareInfo)
              }
            )
          }}
        />
      </div>
    )
  }

  const render = () => {
    return (
      <div className="mt-4 flex-direction-column">
        <div className="flex flex-col lg:flex-row gap-5 mt-4">
          {/* 资金分布 */}
          {getZJFBNode()}

          {/* 今日主力流向 */}
          {getTodayZLLXNode()}
        </div>

        <div className="flex flex-col lg:flex-row gap-5 mt-8">
          {/* 资金流向 */}
          {getZJLXNode()}

          {/* 所属行业资金流向 */}
          <div className="flex-1 border rounded-lg p-4">
            <p className="font-bold text-xl">所属行业资金流向</p>
            <div className="mt-1">
              <Tabs className="m-ant-tabs" items={getIndustryFundFlowTabItems()} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 mt-8">
          {/* 基本信息 */}
          {getCompanyProfile()}
        </div>

        {/* 机构评级 */}
        <div className="mt-8">{getInstitutionalRatings()}</div>

        {/* 高管概览 */}
        <div className="mt-8">{getExecutiveOverview()}</div>

        {/* 分红转送 */}
        <div className="mt-8">{getDividendsTransfer()}</div>

        {/* 股本股东 */}
        {getShareholders()}

        {/* 持仓明细 */}
        {getPositionDetails()}

        {/* 相关新闻 */}
        {getNews()}
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailStock)
