/**
 * @fileOverview dashboard
 * @date 2023-07-05
 * @author poohlaha
 */
import React, { ReactElement, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@stores/index'
import Loading from '@views/components/loading/loading'
import Page from '@views/modules/page'
import RouterUrls from '@route/router.url.toml'
import { Input } from 'antd'
import { Space } from 'antd'
import Utils from '@utils/utils'
import { useNavigate } from 'react-router'
import { getRateClassName } from '@pages/utils'

const Dashboard = (): ReactElement => {
  const { dashboardStore, homeStore } = useStore()
  const navigate = useNavigate()

  /*
  const navigate = useNavigate()

  const toPage = (index: number = 0) => {
    const menu = homeStore.MENU_LIST[index]
    homeStore.onSetSelectMenu(menu.key)
    navigate(`${menu.parentUrl || ''}${menu.url || ''}`)
  }
     */

  useEffect(() => {
    return () => {
      dashboardStore.onReset()
    }
  }, [])

  const getSearchContent = () => {
    if (!dashboardStore.showSearchDialog) {
      return null
    }
    const list = dashboardStore.search.list || []

    return (
      <div className="w100 h-80 search-content overflow-y-auto absolute left-0 top-14 rounded-md shadow right-0 border">
        {dashboardStore.loading && <Loading show={dashboardStore.loading} />}

        {/*
        <div className="search-content flex-align-center h-10 pl-4 pr-4">
          <p className="w-24">代码</p>
          <p className="w-48">名称</p>
          <p className="w-48">简拼</p>
          <p className="w-24">类型</p>
          <p className="w-20"></p>
        </div>
        */}

        {!dashboardStore.loading && (
          <div className="search-body flex-direction-column">
            {list.map((item: Record<string, any> = {}, index: number) => {
              const hasCollect = item.hasCollect ?? false
              return (
                <div
                  className="search-item h-16 flex-align-center cursor-pointer pl-4 pr-4 border-bottom"
                  key={index}
                  onClick={() => {
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
                    <p className="w-24 ml-2 text-right">
                      {!hasCollect && (
                        <svg
                          className="w-4 h-4 color-svg"
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={() => dashboardStore.onAddToMyFundWatchlist(item || {})}
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
    return (
      <Page
        className="dashboard-page"
        contentClassName="flex-direction-column"
        title={{
          label: RouterUrls.DASHBOARD.NAME || ''
        }}
      >
        <div className="dashboard-content flex-center flex-1 mb-40">
          <div className="w-[80%] flex-align-center">
            <Space.Compact className="w100 h-12 relative">
              {/*
              <Select
                rootClassName="m-dashboard-select-modal"
                className="w-40 rounded-l-full flex-align-center m-ant-select"
                value={dashboardStore.search.selected || ''}
                options={dashboardStore.SEARCH_OPTIONS || []}
                onChange={(value: string = '') => {
                  let option: Record<string, any> =
                    (dashboardStore.SEARCH_OPTIONS || []).find((item: Record<string, any>) => item.value === value) ||
                    {}
                  dashboardStore.search.placeholder = option.placeholder || ''
                  dashboardStore.search.selected = value || ''
                }}
              />
              */}
              <div className="flex-1">
                <Input
                  className="rounded-full m-ant-input h-12 pl-6 pr-6"
                  placeholder={dashboardStore.search.placeholder || ''}
                  value={dashboardStore.search.value}
                  onChange={async e => {
                    dashboardStore.search.value = e.target.value || ''

                    if (Utils.isBlank(dashboardStore.search.value)) {
                      dashboardStore.search.list = []
                      dashboardStore.showSearchDialog = false
                    }
                  }}
                  onPressEnter={async () => {
                    if (!Utils.isBlank(dashboardStore.search.value)) {
                      await dashboardStore.onSearch()
                    }
                  }}
                />

                {getSearchContent()}
              </div>
            </Space.Compact>
          </div>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(Dashboard)
