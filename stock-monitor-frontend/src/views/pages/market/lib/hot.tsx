/**
 * @fileOverview 热股榜
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import GroupTemplate from '@views/components/group/one'
import { Tabs } from 'antd'
import { useStore } from '@views/stores'
import TwoTemplateRank from '@pages/market/lib/twoTemplateRank'

const MarketHostStock = (): ReactElement => {
  const { marketStore } = useStore()

  const [activeTabIndex, setActiveTabIndex] = useState(marketStore.HOT_TYPE_LIST[0])
  const [analysisActiveTabIndex, setAnalysisActiveTabIndex] = useState(1)
  const [institutionActiveTabIndex, setInstitutionActiveTabIndex] = useState(1)

  const items: Array<any> = [
    {
      label: '热股',
      key: marketStore.HOT_TYPE_LIST[0]
    },
    {
      label: '热搜',
      key: marketStore.HOT_TYPE_LIST[1]
    },
    {
      label: '版块',
      key: marketStore.HOT_TYPE_LIST[2]
    },
    {
      label: '舆情',
      key: marketStore.HOT_TYPE_LIST[3]
    },
    {
      label: '诊股',
      key: marketStore.HOT_TYPE_LIST[4]
    },
    {
      label: '机构',
      key: marketStore.HOT_TYPE_LIST[5]
    }
  ]

  const getList = () => {
    let list = []
    const formatW = (value: number = 0) => {
      if (!value) return '0'

      if (value >= 10000) {
        return `${(value / 10000).toFixed(1)}w`
      }

      return value
    }

    const getNumberColor = (index: number) => {
      if (index === 0) {
        return '#ff471a'
      }

      if (index === 1) {
        return '#ff471a'
      }

      if (index === 2) {
        return '#faa90e'
      }

      return '#333333'
    }

    let body = []

    // 热股 | 热搜 | 板块
    if (
      activeTabIndex === marketStore.HOT_TYPE_LIST[0] ||
      activeTabIndex === marketStore.HOT_TYPE_LIST[1] ||
      activeTabIndex === marketStore.HOT_TYPE_LIST[2]
    ) {
      body = marketStore.hotStock.list?.body || []
    }

    // 舆情
    if (activeTabIndex === marketStore.HOT_TYPE_LIST[3]) {
      body =
        (marketStore.hotStock || []).length > 0
          ? ((marketStore.hotStock[0] || {}).TplData || {}).aiSentimentRankInfo?.body || []
          : {}
    }

    // 诊股
    if (activeTabIndex === marketStore.HOT_TYPE_LIST[4]) {
      body = (marketStore.hotStock || {}).list?.body || []
    }

    // 机构
    if (activeTabIndex === marketStore.HOT_TYPE_LIST[5]) {
      body = (marketStore.hotStock || {}).list?.body || []
    }

    for (let i = 0; i < body.length; i++) {
      let b = body[i] || ''

      let obj = {
        name: b.name || '',
        logo: b.logo?.logo || b.logoInfo?.logo || '',
        exchange: b.exchange || b.mountSection?.market || '',
        code: b.code || b.stockCode || '',
        tag: b.blockName || '',
        rate: b.pxChangeRate || b.stockPxChangeRate || b.ratio || '-',
        hot: formatW(Number(b.heat || '0')),
        color: getNumberColor(i),
        rankDiff: '-',
        score: b.avgScore || '-',
        num: b.instNum || '-',
        totalNum: b.adjHolding || '-'
      }

      if (activeTabIndex === marketStore.HOT_TYPE_LIST[3]) {
        obj.rankDiff = b.rankDiff || 0
      }

      list.push(obj)
    }

    return list
  }

  const render = () => {
    const list = getList() || []

    return (
      <GroupTemplate title="热股榜" className="mt-8">
        <Tabs
          className="m-ant-tabs wh100"
          items={items}
          activeKey={activeTabIndex}
          onChange={async tabIndex => {
            if (tabIndex === activeTabIndex) return
            setActiveTabIndex(tabIndex)
            await marketStore.onGetHotStock(tabIndex)
          }}
        />

        <div className="mt-4">
          {(activeTabIndex === marketStore.HOT_TYPE_LIST[0] ||
            activeTabIndex === marketStore.HOT_TYPE_LIST[1] ||
            activeTabIndex === marketStore.HOT_TYPE_LIST[2] ||
            activeTabIndex === marketStore.HOT_TYPE_LIST[3]) && <TwoTemplateRank type={1} list={list} />}

          {activeTabIndex === marketStore.HOT_TYPE_LIST[4] && (
            <div className="mt-2">
              <div className="flex-align-center flex-wrap gap-2.5">
                <div
                  className={`${analysisActiveTabIndex === 1 ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  onClick={async () => {
                    setAnalysisActiveTabIndex(1)
                    await marketStore.onGetHotStock(marketStore.HOT_TYPE_LIST[4], 'ab')
                  }}
                >
                  <p className="whitespace-nowrap">A股</p>
                </div>

                <div
                  className={`${analysisActiveTabIndex === 2 ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  onClick={async () => {
                    setAnalysisActiveTabIndex(2)
                    await marketStore.onGetHotStock(marketStore.HOT_TYPE_LIST[4], 'hk')
                  }}
                >
                  <p className="whitespace-nowrap">港股</p>
                </div>

                <div
                  className={`${analysisActiveTabIndex === 3 ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  onClick={async () => {
                    setAnalysisActiveTabIndex(3)
                    await marketStore.onGetHotStock(marketStore.HOT_TYPE_LIST[4], 'us')
                  }}
                >
                  <p className="whitespace-nowrap">美股</p>
                </div>
              </div>

              <div className="mt-2">
                <TwoTemplateRank type={2} list={list} />
              </div>
            </div>
          )}

          {activeTabIndex === marketStore.HOT_TYPE_LIST[5] && (
            <div className="mt-2">
              <div className="flex-align-center flex-wrap gap-2.5">
                <div
                  className={`${institutionActiveTabIndex === 1 ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  onClick={async () => {
                    setInstitutionActiveTabIndex(1)
                    await marketStore.onGetHotStock(marketStore.HOT_TYPE_LIST[5], 'all')
                  }}
                >
                  <p className="whitespace-nowrap">全市场</p>
                </div>

                <div
                  className={`${institutionActiveTabIndex === 2 ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  onClick={async () => {
                    setInstitutionActiveTabIndex(2)
                    await marketStore.onGetHotStock(marketStore.HOT_TYPE_LIST[5], 'ab')
                  }}
                >
                  <p className="whitespace-nowrap">A股</p>
                </div>

                <div
                  className={`${institutionActiveTabIndex === 3 ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  onClick={async () => {
                    setInstitutionActiveTabIndex(3)
                    await marketStore.onGetHotStock(marketStore.HOT_TYPE_LIST[5], 'hk')
                  }}
                >
                  <p className="whitespace-nowrap">港股</p>
                </div>

                <div
                  className={`${institutionActiveTabIndex === 4 ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                  onClick={async () => {
                    setInstitutionActiveTabIndex(4)
                    await marketStore.onGetHotStock(marketStore.HOT_TYPE_LIST[5], 'us')
                  }}
                >
                  <p className="whitespace-nowrap">美股</p>
                </div>
              </div>

              <div className="mt-2">
                <TwoTemplateRank type={3} list={list} />
              </div>
            </div>
          )}
        </div>
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MarketHostStock)
