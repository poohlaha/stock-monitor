/**
 * @fileOverview 行情中心
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Tabs } from 'antd'
import { useStore } from '@views/stores'
import GroupTemplate from '@views/components/group/one'
import MarketCenterGlobal from '@pages/market/lib/center/global'
import GroupTwoTemplate from '@views/components/group/two'
import { createSparkline, getColor, getNumberType, getRateClassName, getWidth, parseCNNumber } from '@pages/utils'
import * as echarts from 'echarts/core'
import Utils from '@utils/utils'
import TwoTemplateRank from '@pages/market/lib/twoTemplateRank'

interface IMarketCenterProps {
  toDetailPage: (item: Record<string, any>) => void
}

const MarketCenter = (props: IMarketCenterProps): ReactElement => {
  const { marketStore } = useStore()

  const industryHotItems = [
    {
      label: '成交额',
      key: 'amount'
    },
    {
      label: '成交量',
      key: 'volume'
    },
    {
      label: '市值',
      key: 'marketValue'
    }
  ]

  const [activeTabIndex, setActiveTabIndex] = useState('global')
  const [industryHotActiveTabIndex, setIndustryHotActiveTabIndex] = useState(industryHotItems[0].key || '')
  const [popularSectionActiveTabIndex, setPopularSectionActiveTabIndex] = useState(0)
  const [mainInActiveTabIndex, setMainInActiveTabIndex] = useState('HY')

  const industryHotTreeChartRef = useRef(null)
  const industryHotChartRef = useRef<echarts.ECharts | null>(null)

  const items: Array<any> = [
    {
      key: 'global',
      label: '全球',
      value: 'global'
    },
    {
      key: 'ab',
      label: 'A股',
      value: 'ab'
    },
    {
      key: 'hk',
      label: '港股',
      value: 'hk'
    },
    {
      key: 'us',
      label: '美股',
      value: 'us'
    },
    {
      key: 'sg',
      label: '新加坡',
      value: 'sg'
    },
    {
      key: 'fund',
      label: '基金',
      value: 'fund'
    },
    {
      key: '7',
      label: '外汇',
      value: ''
    },
    {
      key: '8',
      label: '期货',
      value: ''
    },
    {
      key: '9',
      label: '债券'
    }
  ]

  useEffect(() => {
    if (!industryHotTreeChartRef.current) {
      return
    }

    const industryHotChart = onGetIndustryHotTreeChart()

    // @ts-ignore
    industryHotChartRef.current = industryHotChart

    return () => {
      industryHotChart?.dispose()
    }
  }, [marketStore.stockIndustryHot || []])

  useEffect(() => {
    const handleResize = () => {
      industryHotChartRef.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const onGetIndustryHotTreeChart = () => {
    if (!industryHotTreeChartRef.current || (marketStore.stockIndustryHot || []).length === 0) {
      return
    }

    const data = marketStore.stockIndustryHot || []
    const chart = echarts.init(industryHotTreeChartRef.current)

    const item: Record<string, any> =
      (industryHotItems || []).find((it: Record<string, any> = {}) => it.key === industryHotActiveTabIndex) || {}

    const seriesData = []
    for (let hot of data) {
      seriesData.push({
        name: hot.name || '',
        value: Utils.isObjectNull(item || {}) ? 0 : (hot.rawData || {})[item.key] || 0,
        itemStyle: {
          color: getColor(hot.rawData?.pxChange || 0)
        },
        ...(hot || {})
      })
    }

    const option = {
      tooltip: {
        trigger: 'item',
        confine: true,
        extraCssText: `
          min-width: 180px;
          width: 180px;
          padding: 12px;
          border-radius: 8px;
          border: none;
        `,
        formatter(params: Record<string, any> = {}) {
          const data = params.data || {}

          if (Utils.isObjectNull(data || {}) || !data.name) {
            return ''
          }

          const pxChangeColor = getColor(data.pxChange || '-')
          const pxChangeRateColor = getColor(data.pxChangeRate || '-')
          return `
            <div>
              <p style="font-weight:bold;font-size:14px;margin-bottom:8px;color:#333333">
                ${data.name || ''}
              </p>
              
               <div style="display:flex;justify-content:space-between;">
                    <span>报价:</span>    
                    <span>${data.lastPx || '--'}</span>    
              </div>
              
              <div style="display:flex;justify-content:space-between;">
                    <span>涨跌幅:</span>    
                    <span style="color:${pxChangeRateColor}">${data.pxChangeRate || '--'}</span>    
              </div>
      
              <div style="display:flex;justify-content:space-between;">
                    <span>涨跌额:</span>    
                    <span style="color:${pxChangeColor}">${data.pxChange || '--'}</span>    
              </div>
              
             <div style="display:flex;justify-content:space-between;">
                    <span>成交量:</span>    
                    <span>${data.volume || '--'}</span>    
              </div>
              
               <div style="display:flex;justify-content:space-between;">
                    <span>成交额:</span>    
                    <span>${data.amount || '--'}</span>    
              </div>
              
               <div style="display:flex;justify-content:space-between;">
                    <span>总市值:</span>    
                    <span>${data.marketValue || '--'}</span>    
              </div>
            </div>
            `
        }
      },
      series: [
        {
          type: 'treemap',
          roam: false,
          nodeClick: false,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          breadcrumb: {
            show: false
          },
          label: {
            show: true,
            position: 'inside',
            align: 'center',
            verticalAlign: 'middle',
            formatter(params: Record<string, any>) {
              return `{name|${params.name}}\n{value|${params.data?.amount || ''}}`
            },
            rich: {
              name: {
                align: 'center',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 22
              },
              value: {
                align: 'center',
                fontSize: 12,
                lineHeight: 18
              }
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            gapWidth: 2,
            borderRadius: 8
          },
          data: seriesData || []
        }
      ]
    }

    chart.setOption(option)
    return chart
  }

  // 涨跌分布 | 热力图
  const getRfDistribution = () => {
    const item = items.find((t: Record<string, any> = {}) => t.key === activeTabIndex) || {}
    const total = marketStore.stockRfDistribution?.total || {}
    const ratio = marketStore.stockRfDistribution?.ratio || {}

    const diagram = marketStore.stockRfDistribution?.diagram || []
    const largest = Math.max(...diagram.map((d: Record<any, any> = {}) => d.count)) || 0

    const ratioTotal = (ratio.down || 0) + (ratio.up || 0) + (ratio.balance || 0)
    const upWidth = ((ratio.up || 0) / ratioTotal) * 100
    const balanceWidth = ((ratio.balance || 0) / ratioTotal) * 100
    const downWidth = (ratio.down / ratioTotal) * 100

    return (
      <GroupTwoTemplate>
        <GroupTemplate
          title={`${item.label}涨跌分布`}
          titleRight={
            <p className="text-xs color-gray">
              {total.title || ''} {total.price}
            </p>
          }
          titleSizeClassName="text-xl"
          bodyNeedMargin={false}
          bodyClassName="mt-8"
          className="flex-1"
        >
          <div className="flex-align-center gap-4">
            {(diagram || []).map((d: Record<string, any> = {}, index: number) => {
              let flag = d.status === 'same' ? 0 : d.status === 'up' ? 1 : -1
              let height = getWidth(d.count || 0, largest)
              if (height < 1) {
                height = 1
              }
              return (
                <div className="flex-direction-column flex-align-center" key={index}>
                  <div className="h-[200px] w-8 rounded flex flex-col justify-end items-center">
                    <p className="mb-1">{d.count || 0}</p>
                    <p
                      className="w-full rounded-md shrink-0 h-4"
                      style={{
                        background: getColor(flag) || '',
                        height: `${height}%`
                      }}
                    />
                  </div>
                  <p className="mt-1 whitespace-nowrap">{d.title || ''}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-direction-column">
            <div className="flex-align-center w-full gap-2">
              <div
                className="h-4 rounded-l"
                style={{
                  background: getColor(1),
                  width: `${upWidth}%`
                }}
              />

              <div
                className="h-4"
                style={{
                  background: getColor(0),
                  width: `${balanceWidth}%`
                }}
              />

              <div
                className="h-4 rounded-r"
                style={{
                  background: getColor(-1),
                  width: `${downWidth}%`
                }}
              />
            </div>

            <div className="flex-jsc-between flex-align-center mt-2">
              <div className="flex-align-center">
                <p className="red">上涨</p>
                <p className="red ml-4">{ratio.up || 0}</p>
              </div>

              <div className="flex-align-center">
                <p className="red">{ratio.down || 0}</p>
                <p className="red ml-4">下跌</p>
              </div>
            </div>
          </div>
        </GroupTemplate>

        <GroupTemplate title="热力图" className="flex-1 flex-direction-column">
          <div className="flex-align-center flex-wrap gap-2.5">
            {(industryHotItems || []).map((h: Record<string, any> = {}, index: number) => {
              const active = industryHotActiveTabIndex === h.key
              return (
                <div
                  className={`${active ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  key={index}
                  onClick={async () => {
                    setIndustryHotActiveTabIndex(h.key)
                    await marketStore.onGetStockIndustryHot(activeTabIndex, h.key)
                  }}
                >
                  <p className="whitespace-nowrap">{h.label || ''}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-2 flex h-[250px]">
            <div className="flex-1 min-w-0 aspect-square h-full networth-line" ref={industryHotTreeChartRef}></div>
          </div>
        </GroupTemplate>
      </GroupTwoTemplate>
    )
  }

  // A 股热门板块
  const getAPopularSection = () => {
    const popularSectionList = marketStore.popularSectionList || []
    const tabs = popularSectionList.map((p: Record<string, any> = {}) => p.name || '') || []
    const list = popularSectionList.flatMap((p: Record<string, any> = {}, i: number) => {
      if (i === popularSectionActiveTabIndex) {
        return p.list || []
      }

      return []
    })

    return (
      <GroupTemplate title="A股热门板块" className="flex-1 flex-direction-column mt-8" titleSizeClassName="text-xl">
        <div className="flex-align-center flex-wrap gap-2.5">
          {(tabs || []).map((t: string, index: number) => {
            const active = popularSectionActiveTabIndex === index
            return (
              <div
                className={`${active ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                key={index}
                onClick={async () => {
                  setPopularSectionActiveTabIndex(index)
                }}
              >
                <p className="whitespace-nowrap">{t || ''}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex-wrap gap-4">
          {(list || []).map((l: Record<string, any> = {}, index: number) => {
            const firstList = l.rise_first || []
            const first = firstList.length > 0 ? firstList[0] || {} : {}
            const data = (l.minuteData?.priceinfo || []).map((p: Record<string, any> = {}) => p.price) || []
            let color = getColor(first.ratio?.value || '-')
            return (
              <div
                className="border rounded-lg p-4 flex-align-center w-64 h-24 bg-line-hover hover:shadow-md"
                key={index}
              >
                <div className="flex-1 pr-2 flex-direction-column">
                  <div className="flex-align-center">
                    {Utils.isBlank(l.logo?.logo || '') ? (
                      <div className="w-10 h-10 rounded-full mr=2" />
                    ) : (
                      <img src={l.logo?.logo || null} className="w-10 h-10 rounded-full mr=2" />
                    )}
                    <div className="flex-direction-column ml-2">
                      <p className="font-bold">{l.name || ''}</p>
                      <p className={`font-bold mt-1 ${getRateClassName(l.ratio?.value || '0')}`}>
                        {l.ratio?.value || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">{first.name || ''}</div>
                </div>

                <div className="flex-direction-column">
                  <div
                    className="w-16 h-10"
                    style={{
                      backgroundImage: createSparkline(data || [], color || ''),
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '100% 100%'
                    }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </GroupTemplate>
    )
  }

  // A 股排行
  const getARank = () => {
    return (
      <GroupTemplate title="A股排行" className="flex-1 flex-direction-column mt-8" titleSizeClassName="text-xl">
        <TwoTemplateRank type={4} list={marketStore.stockRankList || []} onAddSelection={() => {}} />
      </GroupTemplate>
    )
  }

  // 主力净流入
  const getMainIn = () => {
    const item = items.find((t: Record<string, any> = {}) => t.key === activeTabIndex) || {}
    const list = marketStore.stockMainMoneyInList || []
    const tabs = (list || {}).map((d: Record<string, any> = {}) => d) || []

    const data = (list || []).flatMap((d: Record<string, any> = {}) => {
      if (d.blockType === mainInActiveTabIndex) {
        return d.data || []
      }

      return []
    })

    const largest =
      Math.max(...(data || []).map((d: Record<any, any> = {}) => Math.abs(parseCNNumber(d.mainNetTurnover)))) || 0
    return (
      <GroupTemplate title={`${item.label}主力净流入`} className="mt-8">
        <div className="flex-align-center flex-wrap gap-2.5">
          {(tabs || []).map((t: Record<string, any> = {}, index: number) => {
            const active = mainInActiveTabIndex === t.blockType
            return (
              <div
                className={`${active ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                key={index}
                onClick={async () => {
                  setMainInActiveTabIndex(t.blockType)
                }}
              >
                <p className="whitespace-nowrap">{t.blockTypeName || ''}</p>
              </div>
            )
          })}
        </div>

        <div className="flex-align-center mt-4">
          <div className="flex-align-center mr-4">
            <div className="bg-red w-2 h-2 rounded-full"></div>
            <div className="ml-1">净流入</div>
          </div>

          <div className="flex-align-center">
            <div className="bg-green w-2 h-2 rounded-full"></div>
            <div className="ml-2">净流出</div>
          </div>
        </div>

        <div className="flex items-start justify-between w100 mt-4">
          {(data || []).map((d: Record<string, any> = {}, index: number) => {
            let flag = getNumberType(d.mainNetTurnover || '0')
            let height = getWidth(parseCNNumber(d.mainNetTurnover || '0'), largest)
            if (height < 1) {
              height = 1
            }

            const color = getColor(flag) || ''
            return (
              <div className="flex flex-col items-center flex-1 min-w-16" key={index}>
                <div className="h-[200px] w-10 rounded flex flex-col justify-end items-center">
                  <p className="whitespace-nowrap" style={{ color }}>
                    {d.mainNetTurnover || '0'}
                  </p>
                  <p
                    className="w-full rounded-md shrink-0 h-4"
                    style={{
                      background: color,
                      height: `${height}%`
                    }}
                  />
                </div>
                <p className="mt-1 whitespace-nowrap">{d.name || ''}</p>
              </div>
            )
          })}
        </div>
      </GroupTemplate>
    )
  }

  const render = () => {
    return (
      <GroupTemplate title="行情中心" className="mt-8">
        <Tabs
          className="m-ant-tabs wh100"
          items={items}
          activeKey={activeTabIndex}
          onChange={async tabIndex => {
            if (tabIndex === activeTabIndex) return
            setActiveTabIndex(tabIndex)

            if (tabIndex === items[0].key) {
              await marketStore.onGetWorldwideMarketCenter()
            }

            if (tabIndex === items[1].key || tabIndex === items[2].key || tabIndex === items[3].key) {
              // await marketStore.onGetOtherMarketCenter(tabIndex)
              await marketStore.onGetStockRfDistribution(tabIndex)
              await marketStore.onGetStockIndustryHot(tabIndex, industryHotActiveTabIndex)
              await marketStore.onGetPopularSection('ab')
              await marketStore.onGetStockRank('ab')
              await marketStore.onGetMainMoneyIn('ab')
            }
          }}
        />

        {activeTabIndex === items[0].key && (
          <MarketCenterGlobal toDetailPage={(item: Record<any, any> = {}) => props.toDetailPage?.(item)} />
        )}

        {activeTabIndex === items[1].key && (
          <div className="flex-direction-column">
            {/* 涨跌分布 | 热力图 */}
            {getRfDistribution()}

            {/* 主力净流入 */}
            {getMainIn()}

            {/* A 股热门板块 */}
            {getAPopularSection()}

            {/* A 股排行 */}
            {getARank()}
          </div>
        )}
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MarketCenter)
