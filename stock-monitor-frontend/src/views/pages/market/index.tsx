/**
 * @fileOverview 市场
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import { useNavigate } from 'react-router'
import Page from '@views/modules/page'
import useMount from '@hooks/useMount'
import { Input, Tabs } from 'antd'
import { getRateClassName } from '@pages/utils'
import Utils from '@utils/utils'
import Loading from '@views/components/loading/loading'
import RouterUrls from '@route/router.url.toml'
import { SearchOutlined } from '@ant-design/icons'

const Market = (): ReactElement => {
  const { marketStore, homeStore } = useStore()
  const navigate = useNavigate()

  const [worldwideMarketActiveTabIndex, setWorldwideMarketActiveTabIndex] = useState('1')
  const [hotWorldwideMarketTabIndex, setHotWorldwideMarketTabIndex] = useState('')
  const [industrialChainTabIndex, setIndustrialChainTabIndex] = useState('')
  const [hotIndicatorTabIndex, setHotIndicatorTabIndex] = useState(0)

  useMount(async () => {
    await onInit()
  })

  const onInit = async () => {
    const queue = []
    queue.push(
      new Promise(async resolve => {
        const res = await marketStore.onGetWorldwideMarketCenter((hotTabIndex: string = '') => {
          setHotWorldwideMarketTabIndex(hotTabIndex)
        })
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetIndustrialChain((tabIndex: string = '') => {
          setIndustrialChainTabIndex(tabIndex)
        })
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetEconomicIndicators()
        resolve(res)
      })
    )

    queue.push(
      new Promise(async resolve => {
        const res = marketStore.onGetHotIndicators()
        resolve(res)
      })
    )

    await marketStore.batchSend(queue)
  }

  const items: Array<any> = [
    {
      key: '1',
      label: '全球',
      value: 'global'
    },
    {
      key: '2',
      label: 'A股',
      value: 'ab'
    },
    {
      key: '3',
      label: '港股',
      value: 'hk'
    },
    {
      key: '4',
      label: '美股',
      value: 'us'
    },
    {
      key: '5',
      label: '新加坡',
      value: 'sg'
    },
    {
      key: '6',
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

  const getIndustrialChainItem = () => {
    if (marketStore.industrialChainMarket.length === 0) {
      return []
    }

    const arr: Array<any> = []
    for (let m of marketStore.industrialChainMarket) {
      const list = m.secondaryIndustries || []
      arr.push({
        ...m,
        key: m.id || '',
        label: m.name || '',
        value: m.id || '',
        children: (
          <div className="mt-4 flex-wrap gap-4">
            {list.map((l: Record<string, any> = {}) => {
              return (
                <div
                  className="border rounded-lg p-4 w-[400px] h-24 bg-line-hover hover:shadow-md flex-align-center"
                  key={l.id}
                >
                  <div className="flex-2 flex-align-center mr-1">
                    <img src={l.cover || ''} className="w-14 h-14 rounded-lg" />
                    <div className="flex-direction-column flex-jsc-center ml-1">
                      <p className="font-bold">{l.name || '-'}</p>
                      <p className="color-gray mt-1">{l.number || '0'}家公司</p>
                    </div>
                  </div>

                  <div className="flex-direction-column flex-jsc-center">
                    <p className={`font-bold ${getRateClassName(l.chgRatio || '-')}`}>{l.chgRatio || '-'}</p>
                    <p className="mt-1 color-gray">年初至今涨跌幅</p>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })
    }

    return arr
  }

  const getSearchContent = () => {
    if (!marketStore.showSearchDialog) {
      return null
    }
    const list = marketStore.search.list || []

    return (
      <div className="h-80 search-content overflow-y-auto absolute left-0 top-14 rounded-md shadow right-0 border w-[600px] bg-white z-10">
        {marketStore.loading && <Loading show={marketStore.loading} />}

        {!marketStore.loading && (
          <div className="search-body flex-direction-column">
            {list.map((item: Record<string, any> = {}, index: number) => {
              const hasCollect = item.hasCollect ?? false
              return (
                <div
                  className="search-item flex-align-center cursor-pointer pt-2 pb-2 pl-4 pr-4 border-bottom bg-line-hover"
                  key={index}
                  onMouseDown={() => {
                    const type = item.type || '' // 类型: etf | fund | stock
                    const market = item.market || '' // 市场: ab | hk | us | sg
                    homeStore.selectedMenu = `${RouterUrls.MARKET.KEY || ''}-${homeStore.MENU_LIST[2].key || ''}`
                    navigate(
                      `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.DETAIL.URL}/${item.code || ''}?code=${item.code || ''}&type=${type || ''}&market=${market || ''}`
                    )
                  }}
                >
                  <div className="flex-align-center w100 text-base">
                    <div className="flex-direction-column flex-1">
                      <p className="font-bold">{item.name || ''}</p>
                      <div className="flex-align-center ml-1">
                        <p className="bg-purple-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1">
                          {item.exchange || ''}
                        </p>
                        <p className="pl-1">{item.code || ''}</p>
                      </div>
                    </div>
                    <p className="pl-1 w-24 font-bold text-center">{item.price}</p>
                    <p className={`pl-1 w-24 font-bold text-center ${getRateClassName(item.ratio)}`}>{item.ratio}</p>
                    <p className="w-8 ml-2 text-right">
                      {!hasCollect && (
                        <svg
                          className="w-4 h-4 color-svg"
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={() => marketStore.onAddToMyFundWatchlist(item || {})}
                          onMouseDown={e => {
                            e.stopPropagation()
                          }}
                        >
                          <path
                            d="M953.37931 512C953.37931 268.232939 755.767084 70.62069 512 70.62069 268.232934 70.62069 70.62069 268.232939 70.62069 512 70.62069 755.767061 268.232934 953.37931 512 953.37931 755.767084 953.37931 953.37931 755.767061 953.37931 512ZM547.310345 476.689655 547.310345 264.858364C547.310345 245.21731 531.501374 229.517241 512 229.517241 492.362681 229.517241 476.689655 245.340001 476.689655 264.858364L476.689655 476.689655 264.858359 476.689655C245.217315 476.689655 229.517241 492.498635 229.517241 512 229.517241 531.637326 245.340001 547.310345 264.858359 547.310345L476.689655 547.310345 476.689655 759.141636C476.689655 778.78269 492.498626 794.482759 512 794.482759 531.637319 794.482759 547.310345 778.659999 547.310345 759.141636L547.310345 547.310345 759.141694 547.310345C778.78272 547.310345 794.482759 531.501365 794.482759 512 794.482759 492.362674 778.660017 476.689655 759.141694 476.689655L547.310345 476.689655ZM0 512C0 229.230209 229.230204 0 512 0 794.769832 0 1024 229.230209 1024 512 1024 794.769791 794.769832 1024 512 1024 229.230204 1024 0 794.769791 0 512Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const render = () => {
    const hotNames =
      (marketStore.worldwideMarket?.hot_index || []).map((h: Record<string, any> = {}) => {
        return { name: h.name || '', area: h.area || '' }
      }) || []
    let hotList =
      (marketStore.worldwideMarket?.hot_index || []).filter(
        (h: Record<string, any> = {}) => h.area === hotWorldwideMarketTabIndex
      ) || []
    hotList = hotList.flatMap((item: Record<string, any> = {}) => item.index_list || [])

    return (
      <Page
        contentClassName="market-page overflow-y-auto flex-direction-column pt-4 pb-4 no-scrollbar"
        title={{
          show: false
        }}
      >
        {/* search */}
        <div className="search-box border-bottom h-16 flex-align-center">
          <img
            src="https://psstatic.cdn.bcebos.com/aladdin/finance_pc/logo_1764579212000.png"
            className="mr-4 h100 w-32"
          />
          <div className="flex-direction-column flex-1 relative">
            <Input
              prefix={<SearchOutlined />}
              className="rounded-lg m-ant-input h-10 pl-2 pr-2 bg-[#f5f6fa] w-[600px]"
              placeholder={marketStore.search.placeholder || ''}
              value={marketStore.search.value}
              onChange={async e => {
                marketStore.search.value = e.target.value || ''

                if (Utils.isBlank(marketStore.search.value)) {
                  marketStore.search.list = []
                  marketStore.showSearchDialog = false
                }
              }}
              onBlur={e => {
                if (e.currentTarget.parentElement?.contains(e.relatedTarget)) {
                  return
                }

                marketStore.showSearchDialog = false
              }}
              onPressEnter={async () => {
                if (!Utils.isBlank(marketStore.search.value)) {
                  await marketStore.onSearch()
                }
              }}
            />

            {getSearchContent()}
          </div>
        </div>

        {/* 全球市场
        <div className="market-item flex-direction-column">
          <p className="font-bold text-xl">全球市场</p>
          <div className="mt-4">
            <Tabs
              className="m-ant-tabs wh100"
              items={marketStore.worldwide?.tabs || []}
              activeKey={worldwideActiveTabIndex}
              onChange={async (tabIndex) => {
                if (tabIndex === worldwideActiveTabIndex) return
                const tab = (marketStore.worldwide?.tabs || []).find((c: Record<any, any> = {}) => c.key === tabIndex) || {}
                setWorldwideActiveTabIndex(tabIndex)
                await marketStore.onGetWorldwideName(tab.market || '')
              }}
            />

            <div className="mt-4 flex-wrap gap-4">
              {(marketStore.worldwide.list || []).map((item: Record<string, any> = {}, index: number) => {
                const ratioClass = getRateClassName(item.ratio || '-')
                  let color = ''
                  if (ratioClass === 'red') {
                      color = '#f5222d'
                  } else if (ratioClass === 'green') {
                      color = '#037b66'
                  } else {
                      color = '#666666'
                  }
                return (
                  <div className="flex-direction-column border rounded-lg p-4 w-64 h-24 bg-line-hover hover:shadow-md" key={index}>
                    <div className="flex-align-center">
                      <div className="flex-1 flex-align-center">
                        <img src={item.logo?.logo || ''} className="w-8 h-8 mr-2 rounded-full border" />
                        <div className="flex-direction-column">
                          <p className="font-bold">{item.name || '-'}</p>
                          <div className="flex-align-center text-xs mt-1">
                            <p className="bg-[#00add7] p-0.5 mr-1 text-white rounded">{item.exchange || '-'}</p>
                            <p className="overflow-hidden text-ellipsis whitespace-nowrap">{item.code || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-1 w-16 h-10"
                           style={{
                               backgroundImage: createSparkline(item.p?.split(',') || [], color || ''),
                               backgroundRepeat:'no-repeat',
                               backgroundSize:'100% 100%'
                           }}
                      >
                      </div>
                    </div>

                    <div className="flex-align-center mt-1">
                      <p className="font-bold text-base flex-1">{item.lastPrice}</p>
                      <div className="flex-align-center ml-1 font-bold">
                        <p className={`mr-2 ${getRateClassName(item.increase || '-')}`}>{item.increase || '-'}</p>
                        <p className={`${ratioClass || ''}`}>{item.ratio || '-'}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        */}

        {/* 行情中心 */}
        <div className="market-item flex-direction-column mt-4">
          <p className="font-bold text-2xl">行情中心</p>
          <div className="mt-4">
            <Tabs
              className="m-ant-tabs wh100"
              items={items}
              activeKey={worldwideMarketActiveTabIndex}
              onChange={async tabIndex => {
                if (tabIndex === worldwideMarketActiveTabIndex) return
                setWorldwideMarketActiveTabIndex(tabIndex)

                if (tabIndex === '1') {
                  await marketStore.onGetWorldwideMarketCenter()
                }

                if (tabIndex === '2' || tabIndex === '3' || tabIndex === '4') {
                  const item = items.find((i: Record<string, any> = {}) => i.key === tabIndex) || {}
                  await marketStore.onGetOtherMarketCenter(item.value || '')
                }
              }}
            />

            {worldwideMarketActiveTabIndex === '1' && (
              <div className="mt-4">
                <div className="mt-2 flex-wrap worldwide-center">
                  <div className="flex-1 flex-direction-column">
                    <p className="font-bold text-xl">全球指数</p>
                    <div className="h-8 color-gray flex-align-center pl-2 pr-2">
                      <div className="flex-2">名称</div>
                      <div className="flex-1">涨跌幅</div>
                      <div className="flex-1">加自选</div>
                    </div>

                    <div className="mt-2">
                      {(marketStore.worldwideMarket?.index_map || []).map((m: Record<string, any> = {}) => {
                        return (
                          <div
                            className="flex-align-center pt-2 pb-2 bg-line-hover pl-2 pr-2 rounded-md"
                            key={m.code || '-'}
                          >
                            <div className="flex-2 flex-direction-column">
                              <p className="font-bold theme-hover">{m.name || '-'}</p>
                              <div className="flex-align-center">
                                <p className="color-gray text-xs">{m.code || '-'}</p>
                                <p className="color-gray text-xs ml-1 bg-menu-active p-0.5 rounded">
                                  {m.status || '-'}
                                </p>
                              </div>
                            </div>

                            <div className="flex-1">
                              <p className={getRateClassName(m.ratio || '-')}>{m.ratio || '-'}</p>
                            </div>

                            <div className="flex-1">
                              <svg
                                className="w-4 h-4 color-svg"
                                viewBox="0 0 1024 1024"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M953.37931 512C953.37931 268.232939 755.767084 70.62069 512 70.62069 268.232934 70.62069 70.62069 268.232939 70.62069 512 70.62069 755.767061 268.232934 953.37931 512 953.37931 755.767084 953.37931 953.37931 755.767061 953.37931 512ZM547.310345 476.689655 547.310345 264.858364C547.310345 245.21731 531.501374 229.517241 512 229.517241 492.362681 229.517241 476.689655 245.340001 476.689655 264.858364L476.689655 476.689655 264.858359 476.689655C245.217315 476.689655 229.517241 492.498635 229.517241 512 229.517241 531.637326 245.340001 547.310345 264.858359 547.310345L476.689655 547.310345 476.689655 759.141636C476.689655 778.78269 492.498626 794.482759 512 794.482759 531.637319 794.482759 547.310345 778.659999 547.310345 759.141636L547.310345 547.310345 759.141694 547.310345C778.78272 547.310345 794.482759 531.501365 794.482759 512 794.482759 492.362674 778.660017 476.689655 759.141694 476.689655L547.310345 476.689655ZM0 512C0 229.230209 229.230204 0 512 0 794.769832 0 1024 229.230209 1024 512 1024 794.769791 794.769832 1024 512 1024 229.230204 1024 0 794.769791 0 512Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 热门全球指数 */}
                  <div className="min-w-[350px] flex-1 h-full pl-2 pr-2">
                    <p className="font-bold text-xl">热门全球指数</p>
                    <div className="mt-4 flex-direction-column">
                      <div className="flex-align-center">
                        {(hotNames || []).map((h: Record<string, any> = {}) => {
                          const active = hotWorldwideMarketTabIndex === h.area
                          return (
                            <div
                              className={`${active ? 'hot-active theme-bg' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                              key={h.area || ''}
                              onClick={() => {
                                setHotWorldwideMarketTabIndex(h.area)
                              }}
                            >
                              <p className="">{h.name || ''}</p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 flex-direction-column">
                        <div className="h-8 color-gray flex-align-center pl-2 pr-2">
                          <div className="flex-2">代码/名称</div>
                          <div className="flex-1">最新价</div>
                          <div className="flex-1">涨跌幅</div>
                          <div className="w-12">加自选</div>
                        </div>

                        <div className="mt-2">
                          {(hotList || []).map((l: Record<string, any> = {}) => {
                            return (
                              <div
                                className="flex-align-center pt-2 pb-2 bg-line-hover pl-2 pr-2 rounded-md mb-2"
                                key={l.code || '-'}
                              >
                                <div className="flex-2 flex-align-center pr-1">
                                  <div className="mr-1">
                                    <img src={l.logo?.logo || ''} className="h-10 w-10 rounded-full" />
                                  </div>

                                  <div className="flex-direction-column flex-1">
                                    <p className="font-bold">{l.name || '-'}</p>

                                    <div className="flex-align-center">
                                      <p className="color-gray text-xs overflow-ellipsis overflow-hidden whitespace-nowrap">
                                        {l.code || '-'}
                                      </p>
                                      <p className="color text-xs ml-1 bg-menu-active p-0.5 rounded whitespace-nowrap">
                                        {l.status || '-'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <p className="font-bold">{l.last_px || '-'}</p>
                                </div>

                                <div className="flex-1">
                                  <p className={getRateClassName(l.px_change_rate || '-')}>{l.px_change_rate || '-'}</p>
                                </div>

                                <div className="w-12">
                                  <svg
                                    className="w-4 h-4 color-svg"
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M953.37931 512C953.37931 268.232939 755.767084 70.62069 512 70.62069 268.232934 70.62069 70.62069 268.232939 70.62069 512 70.62069 755.767061 268.232934 953.37931 512 953.37931 755.767084 953.37931 953.37931 755.767061 953.37931 512ZM547.310345 476.689655 547.310345 264.858364C547.310345 245.21731 531.501374 229.517241 512 229.517241 492.362681 229.517241 476.689655 245.340001 476.689655 264.858364L476.689655 476.689655 264.858359 476.689655C245.217315 476.689655 229.517241 492.498635 229.517241 512 229.517241 531.637326 245.340001 547.310345 264.858359 547.310345L476.689655 547.310345 476.689655 759.141636C476.689655 778.78269 492.498626 794.482759 512 794.482759 531.637319 794.482759 547.310345 778.659999 547.310345 759.141636L547.310345 547.310345 759.141694 547.310345C778.78272 547.310345 794.482759 531.501365 794.482759 512 794.482759 492.362674 778.660017 476.689655 759.141694 476.689655L547.310345 476.689655ZM0 512C0 229.230209 229.230204 0 512 0 794.769832 0 1024 229.230209 1024 512 1024 794.769791 794.769832 1024 512 1024 229.230204 1024 0 794.769791 0 512Z"
                                      fill="currentColor"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {worldwideMarketActiveTabIndex === '2' && (
              <div className="mt-4">
                <div className="mt-2 flex-wrap h-96 worldwide-center"></div>
              </div>
            )}
          </div>
        </div>

        {/* 产业链 */}
        <div className="flex-direction-column mt-8">
          <div className="flex-direction-column">
            <p className="font-bold text-2xl">全球宏观</p>

            <div className="flex-direction-column mt-4">
              <p className="font-bold text-xl">产业链</p>
              <div className="mt-4">
                <Tabs
                  className="wh100"
                  items={getIndustrialChainItem()}
                  activeKey={industrialChainTabIndex}
                  onChange={async tabIndex => {
                    if (tabIndex === industrialChainTabIndex) return
                    setIndustrialChainTabIndex(tabIndex)
                  }}
                />
              </div>
            </div>

            <div className="flex-direction-column mt-8">
              <p className="font-bold text-xl">经济指标热图</p>
              <div className="mt-4 border rounded-lg">
                <div className="colums flex-align-center">
                  <div className="flex-1 h-12"></div>
                  {(marketStore.economicIndicators?.columns || []).map((c: Record<string, any> = {}, index: number) => {
                    return (
                      <div className="flex-1 h-14 border-left flex-center" key={index}>
                        <p className="text-base font-bold">{c.metricName || '-'}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="rows flex-direction-column">
                  {(marketStore.economicIndicators?.rows || []).map((r: Record<string, any> = {}, index: number) => {
                    const cells = r.cells || []
                    return (
                      <div className="flex-align-center border-top" key={index}>
                        <div className="flex-1 h-14 border-left flex-center">
                          <img src={r.countryIcon || ''} className="rounded-full w-6 h-6 mr-1" />
                          <p className="text-base font-bold">{r.country || '-'}</p>
                        </div>

                        {(cells || []).map((c: Record<string, any> = {}, i: number) => {
                          let rawRatioColor = ''
                          const rawRatio = c.rawRatio || 0
                          if (rawRatio > 0) {
                            rawRatioColor = '#dae3fc'
                          } else if (rawRatio < 0) {
                            rawRatioColor = '#ffedcc'
                          }
                          return (
                            <div
                              className="flex-1 h-14 border-left flex-center"
                              style={{
                                background: rawRatioColor || ''
                              }}
                              key={`${index}_${i}`}
                            >
                              <p className="text-base font-bold">{c.value || ''}</p>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex-direction-column mt-8">
              <p className="font-bold text-xl">热门指标</p>
              <div className="mt-4 flex-direction-column">
                <div className="flex-align-center flex-wrap gap-2.5">
                  {(marketStore.hotIndicators.tabs || []).map((h: Record<string, any> = {}, index: number) => {
                    const active = hotIndicatorTabIndex === index
                    return (
                      <div
                        className={`${active ? 'hot-active theme-bg' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                        key={index}
                        onClick={async () => {
                          setHotIndicatorTabIndex(index)
                          await marketStore.onGetHotIndicators(h.name || '')
                        }}
                      >
                        <p className="whitespace-nowrap">{h.name || ''}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 flex-direction-column">
                  <div className="flex-align-center text-xs pl-2 pr-2 h-8">
                    <div className="flex-2 color-gray">指标名称</div>
                    <div className="flex-1 color-gray">最新值</div>
                    <div className="flex-1 color-gray">前值</div>
                    <div className="flex-1 color-gray">路透调查值</div>
                    <div className="flex-1 color-gray">发布时间</div>
                  </div>

                  {(marketStore.hotIndicators.list || []).map((l: Record<string, any> = {}, index: number) => {
                    return (
                      <div
                        className="p-2 rounded-lg bg-line-hover change-color cursor-pointer border-top flex-align-center pl-2 pr-2"
                        key={index}
                      >
                        <div className="flex-2 flex-align-center pt-2 pb-2">
                          <img src={l.countryIcon || ''} className="w-6 h-6 mr-1" />
                          <p className="">
                            {l.country || ''}
                            {l.name || ''}
                          </p>
                        </div>

                        <div className="flex-1">{l.value || '-'}</div>
                        <div className="flex-1">{l.priorValue || '-'}</div>
                        <div className="flex-1">{l.rtrPoll || '-'}</div>
                        <div className="flex-1">{l.time || '-'}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(Market)
