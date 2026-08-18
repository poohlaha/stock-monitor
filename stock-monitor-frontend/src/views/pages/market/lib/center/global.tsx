/**
 * @fileOverview 行情中心-全球
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { getRateClassName } from '@pages/utils'
import { useStore } from '@views/stores'
import GroupTwoTemplate from '@views/components/group/two'
import GroupTemplate from '@views/components/group/one'

interface IMarketCenterGlobalProps {
  toDetailPage: (item: Record<string, any>) => void
  onAddSelection?: (item: Record<string, any>) => void
}


const MarketCenterGlobal = (props: IMarketCenterGlobalProps): ReactElement => {
  const { marketStore } = useStore()

  const render = () => {
    const hotNames =
      (marketStore.worldwideMarket?.hot_index || []).map((h: Record<string, any> = {}) => {
        return { name: h.name || '', area: h.area || '' }
      }) || []
    let hotList =
      (marketStore.worldwideMarket?.hot_index || []).filter(
        (h: Record<string, any> = {}) => h.area === marketStore.market.tabs.center.globalHotActiveTabIndex
      ) || []
    hotList = hotList.flatMap((item: Record<string, any> = {}) => item.index_list || [])

    return (
      <GroupTwoTemplate>
        <GroupTemplate title="全球指数" className="flex-1">
          <div className="h-8 color-gray flex-align-center pl-2 pr-2">
            <div className="flex-2">名称</div>
            <div className="flex-1">涨跌幅</div>
            <div className="flex-1">加自选</div>
          </div>

          <div className="mt-2">
            {(marketStore.worldwideMarket?.index_map || []).map((m: Record<string, any> = {}) => {
              return (
                <div className="flex-align-center pt-2 pb-2 bg-line-hover pl-2 pr-2 rounded-md" key={m.code || '-'}
                     onMouseDown={() => {
                       console.log('item: ', m)
                       /*
                       props.toDetailPage({
                         ...(m || {}),
                         type: 'stock'
                       })
                        */
                     }}
                >
                  <div className="flex-2 flex-direction-column">
                    <p className="font-bold theme-hover">{m.name || '-'}</p>
                    <div className="flex-align-center">
                      <p className="color-gray text-xs">{m.code || '-'}</p>
                      <p className="color-gray text-xs ml-1 bg-menu-active p-0.5 rounded">{m.status || '-'}</p>
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
                      onClick={async () => {
                        console.log('item: ', m)
                        props.onAddSelection?.(m)
                      }}
                      onMouseDown={e => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
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
        </GroupTemplate>

        <GroupTemplate title="热门全球指数" className="flex-1">
          <div className="mt-4 flex-direction-column">
            <div className="flex-align-center">
              {(hotNames || []).map((h: Record<string, any> = {}) => {
                const active = marketStore.market.tabs.center.globalHotActiveTabIndex === h.area
                return (
                  <div
                    className={`${active ? 'hot-active active' : ''} menu-item pl-2 pr-2 pt-1 pb-1 rounded-lg mr-2 change-color cursor-pointer`}
                    key={h.area || ''}
                    onClick={() => {
                      marketStore.market.tabs.center.globalHotActiveTabIndex = h.area
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
                      onMouseDown={() => {
                        console.log('item: ', l)
                        /*
                        props.toDetailPage({
                          ...(l || {}),
                          type: 'stock'
                        })
                         */
                      }}
                    >
                      <div className="flex-2 flex-align-center pr-1">
                        <div className="mr-2">
                          <img src={l.logo?.logo || null} className="h-10 w-10 rounded-full" />
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
                        <p className={`${getRateClassName(l.px_change_rate || '-')} font-bold`}>
                          {l.px_change_rate || '-'}
                        </p>
                      </div>

                      <div className="w-12">
                        <svg
                          className="w-4 h-4 color-svg"
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={async () => {
                            console.log('item: ', l)
                            props.onAddSelection?.(l)
                          }}
                          onMouseDown={e => {
                            e.stopPropagation()
                            e.preventDefault()
                          }}
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
        </GroupTemplate>
      </GroupTwoTemplate>
    )
  }

  return render()
}

export default observer(MarketCenterGlobal)
