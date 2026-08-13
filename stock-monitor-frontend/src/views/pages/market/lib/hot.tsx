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
import { getRateClassName } from '@pages/utils'
import Utils from '@utils/utils'
import UpPng from '@assets/images/up.png'
import DownPng from '@assets/images/down.png'

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

  const createListTemplate = (list: Array<Record<string, any>> = [], type: number = 1) => {
    return (
      <div className="flex-direction-column">
        <div className="grid grid-cols-2 gap-x-5">
          {/* 左侧表头 */}
          <div className="flex-align-center color-gray h-8 min-h-8">
            <p className="w-16 text-c pl-2">排名</p>
            <p className="flex-2 text-l">名称/代码</p>
            {type === 1 && (
              <>
                <p className="flex-1 text-r">涨跌幅</p>
                <p className="flex-1 text-r pr-2">热度</p>
              </>
            )}

            {type === 2 && <p className="flex-1 text-r pr-2">综合评分</p>}
            {type === 3 && (
              <>
                <p className="flex-1 text-r">持股机构数</p>
                <p className="flex-1 text-r pr-2">持股总数</p>
              </>
            )}
          </div>

          {/* 右侧表头 */}
          <div className="flex-align-center color-gray">
            <p className="w-16 text-c pl-2">排名</p>
            <p className="flex-2 text-l">名称/代码</p>
            {type === 1 && (
              <>
                <p className="flex-1 text-r">涨跌幅</p>
                <p className="flex-1 text-r pr-2">热度</p>
              </>
            )}

            {type === 2 && <p className="flex-1 text-r pr-2">综合评分</p>}
          </div>

          {(list || []).map((l: Record<string, any> = {}, index: number) => {
            const rankDiff = l.rankDiff
            return (
              <div
                className="flex-1 h-16 border-bottom bg-line-hover flex-align-center min-h-16 hover:rounded-md"
                key={index}
              >
                <div className="flex-direction-column w-16 pl-2">
                  <p
                    className="font-bold text-base text-c"
                    style={{
                      color: l.color || ''
                    }}
                  >
                    {index + 1}
                  </p>
                  {rankDiff !== '-' && (
                    <div className="mt-1 flex-center">
                      {rankDiff > 0 && (
                        <div className="flex-align-center">
                          <img src={UpPng} className="w-w h-2" />
                          <p className="pl-0.5 text-xs">{rankDiff > 99 ? '99+' : rankDiff}</p>
                        </div>
                      )}
                      {rankDiff < 0 && (
                        <div className="flex-align-center">
                          <img src={DownPng} className="w-w h-2" />
                          <p className="pl-0.5 text-xs">{rankDiff}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-2 text-l flex-align-center">
                  {!Utils.isBlank(l.logo || '') && (
                    <img src={l.logo || ''} className="w-10 h-10 mr-2 rounded-full border" />
                  )}
                  <div className="flex-direction-column">
                    <p className="font-bold">{l.name || ''}</p>
                    <div className="mt-1 flex-align-center text-xs">
                      {!Utils.isBlank(l.exchange || '') && (
                        <p className="bg-[#00add7] p-0.5 mr-1 text-white rounded">{l.exchange || ''}</p>
                      )}
                      <p className="">{l.code || ''}</p>
                      {!Utils.isBlank(l.tag || '') && <p className="notice p-0.5">{l.tag || ''}</p>}
                    </div>
                  </div>
                </div>
                {type === 1 && (
                  <>
                    <p className={`flex-1 pr-2 text-r font-bold ${getRateClassName(l.rate || '-')}`}>{l.rate || '-'}</p>
                    <div className="flex-1 text-r pr-1 flex-align-center flex-jsc-end">
                      <svg
                        className="w-4 h-4 red mr-1"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M442.514286 73.142857c82.529524 64.24381 140.239238 126.610286 173.129143 187.099429 31.158857 57.295238 43.666286 115.907048 37.546666 175.835428l-1.219047 9.996191 6.095238-4.973715a174.055619 174.055619 0 0 0 49.249524-69.607619l2.681904-7.411809 7.704381-23.04c82.285714 55.734857 123.440762 150.064762 123.440762 283.062857C841.142857 823.515429 665.795048 950.857143 521.654857 950.857143c-144.11581 0-308.224-85.333333-334.750476-263.875048-26.550857-178.541714 83.480381-261.90019 158.427429-378.197333C395.288381 231.253333 427.690667 152.697905 442.514286 73.142857z m33.718857 154.575238c-17.554286 41.447619-39.424 82.407619-65.536 122.904381l-8.313905 12.653714c-8.411429 12.507429-17.310476 24.941714-28.818286 40.374858l-40.96 54.467047c-63.634286 86.869333-80.944762 136.021333-68.851809 217.526857 17.92 120.441905 128.341333 197.778286 257.901714 197.778286 120.905143 0 241.785905-110.933333 241.785905-249.344 0-61.976381-9.825524-111.323429-29.110857-149.699048-8.240762 9.411048-17.237333 18.285714-26.965334 26.59962l-159.085714 130.023619 26.697143-195.364572c6.41219-46.811429-2.462476-92.208762-27.648-138.483809-13.214476-24.30781-31.98781-49.737143-56.368762-76.166096l-8.338286-8.850285-6.387809 15.579428z"
                          fill="currentColor"
                        ></path>
                      </svg>
                      <p>{l.hot || ''}</p>
                    </div>
                  </>
                )}

                {type === 2 && <p className="flex-1 text-r pr-2">{l.score || '-'}</p>}

                {type === 3 && (
                  <>
                    <p className="flex-1 text-r pr-2">{l.num || '-'}</p>
                    <p className="flex-1 text-r pr-2">{l.totalNum || '-'}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
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
            activeTabIndex === marketStore.HOT_TYPE_LIST[3]) &&
            createListTemplate(list, 1)}

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

              <div className="mt-2">{createListTemplate(list, 2)}</div>
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

              <div className="mt-2">{createListTemplate(list, 3)}</div>
            </div>
          )}
        </div>
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MarketHostStock)
