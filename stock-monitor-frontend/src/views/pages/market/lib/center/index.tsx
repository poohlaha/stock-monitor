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
import { createSparkline, getColor, getRateClassName, getWidth } from '@pages/utils'
import * as echarts from 'echarts/core'

const MarketCenter = (): ReactElement => {
  const { marketStore } = useStore()

  const [activeTabIndex, setActiveTabIndex] = useState('global')
  const [industryHotActiveTabIndex, setIndustryHotActiveTabIndex] = useState('amount')
  const [popularSectionActiveTabIndex, setPopularSectionActiveTabIndex] = useState(0)

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

  const onGetIndustryHotTreeChart = () => {
    if (!industryHotTreeChartRef.current || (marketStore.stockIndustryHot || []).length === 0) {
      return
    }

    const data = marketStore.stockIndustryHot || []
    const chart = echarts.init(industryHotTreeChartRef.current)

    const seriesData = []
    for (let hot of data) {
      seriesData.push({
        name: hot.name || '',
        value: hot.rawData?.marketValue || 0,
        itemStyle: {
          color: getColor(hot.rawData?.marketValue || 0)
        },
        ...(hot || {})
      })
    }

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      series: [
        {
          type: 'treemap',
          data: seriesData || []
        }
      ]
    }

    console.log('option: ', option)
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
                  <p className="mt-1">{d.title || ''}</p>
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
                  <p className="whitespace-nowrap">{h.name || ''}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-2 flex h-[250px]">
            <div
              className="flex-1 min-w-0 aspect-square h-full border-right networth-line"
              ref={industryHotTreeChartRef}
            ></div>
          </div>
        </GroupTemplate>
      </GroupTwoTemplate>
    )
  }

  // A 股热门板块
  const getAPopularSection = () => {
    const popularSectionList = marketStore.popularSectionList || []
    const tabs = popularSectionList.map((p: Record<string, any> = {}) => p.name || '') || []
    const list =
      popularSectionList
        .map((p: Record<string, any> = {}, i: number) => {
          if (i === popularSectionActiveTabIndex) {
            return p.list || []
          }

          return null
        })
        .filter(Boolean) || []
    return (
      <GroupTemplate title="A股热门板块" className="flex-1 flex-direction-column mt-8" titleSizeClassName="text-xl">
        <div className="flex-align-center flex-wrap gap-2.5">
          {(tabs || []).map((t: Record<string, any> = {}, index: number) => {
            const active = popularSectionActiveTabIndex === index
            return (
              <div
                className={`${active ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                key={index}
                onClick={async () => {
                  setPopularSectionActiveTabIndex(index)
                }}
              >
                <p className="whitespace-nowrap">{t.name || ''}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-2">
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
                    <img src={l.logo?.logo || ''} className="w-10 h-10 rounded-full mr=2" />
                    <div className="flex-direction-column">
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
      <GroupTemplate
        title="A股排行"
        className="flex-1 flex-direction-column mt-8"
        titleSizeClassName="text-xl"
      ></GroupTemplate>
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
            }
          }}
        />

        {activeTabIndex === items[0].key && <MarketCenterGlobal />}

        {activeTabIndex === items[1].key && (
          <div className="flex-direction-column">
            {/* 涨跌分布 | 热力图 */}
            {getRfDistribution()}

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
