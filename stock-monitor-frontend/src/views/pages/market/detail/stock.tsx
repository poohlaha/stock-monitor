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
import { getColor, getRateClassName } from '@pages/utils'
import * as echarts from 'echarts/core'

interface IMarketDetailStockProps {
  resetSize: Function
  code: string
  market: string
}

const MarketDetailStock = (props: IMarketDetailStockProps): ReactElement => {
  const { marketStore } = useStore()
  const [zjlxActiveTabIndex, setZjlxActiveTabIndex] = useState('1')
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

    const getWidth = (value: number = 0) => {
      if (largest === 0) {
        return 0
      }

      return (Math.abs(value) / largest) * 100
    }

    return (
      <>
        <div className="color-gray flex-align-center">
          <p className="flex-1">类别</p>
          <p className="flex-1"></p>
          <p className="flex-1 text-r">净流入</p>
          {type === 1 && (
            <>
              <p className="flex-1">流入</p>
              <p className="flex-1">流出</p>
            </>
          )}
        </div>

        {items.map((l: Record<string, any> = {}, index: number) => {
          const width = getWidth(l.value)
          return (
            <div className="flex-align-center h-12 border-bottom" key={index}>
              <div className="flex-align-center pr-1 flex-1">
                <p className="">{l.name}</p>
              </div>
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
                      width: getWidth(l.value)
                    }}
                  ></p>
                )}
              </div>
              <p className={`flex-1 ${getRateClassName(l.netTurnover || 0)} pr-1 font-bold text-r`}>
                {l.netTurnover || 0}
              </p>
              {type === 1 && (
                <>
                  <p className="flex-1 pr-1">{l.turnoverIn || 0}</p>
                  <p className="flex-1 pr-1">{l.turnoverOut || 0}</p>
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
      <div className="flex-direction-column flex-1">
        <div className="flex-align-center flex-jsc-between">
          <div className="flex-align-center pr-2">
            <p className="font-bold text-lg mr-1">资金分布</p>
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
              <svg
                className="w-6 h-6 color-gray"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
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
      <div className="flex-direction-column flex-1">
        <div className="flex-align-center pr-2 flex-jsc-between">
          <p className="font-bold text-lg mr-1">今日主力流向</p>
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
      <div className="flex-direction-column flex-1">
        <p className="font-bold text-lg">资金流向</p>
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
          <div className="flex-1">
            <p className="font-bold text-lg">所属行业资金流向</p>
            <div className="mt-1">
              <Tabs className="m-ant-tabs" items={getIndustryFundFlowTabItems()} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailStock)
