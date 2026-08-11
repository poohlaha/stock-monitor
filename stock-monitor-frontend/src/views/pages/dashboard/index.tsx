/**
 * @fileOverview dashboard
 * @date 2023-07-05
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@stores/index'
import Page from '@views/modules/page'
import useMount from '@hooks/useMount'
import RouterUrls from '@route/router.url.toml'
import { useNavigate } from 'react-router'

const Dashboard = (): ReactElement => {
  const { marketStore, homeStore } = useStore()

  const navigate = useNavigate()

  useMount(async () => {
    await marketStore.onGetWatchList()
  })

  const render = () => {
    return (
      <Page
        className="dashboard-page"
        contentClassName="flex-direction-column"
        title={{
          show: false
        }}
      >
        <div className="dashboard-content">
          {/* 我的自选 */}
          <div className="flex-direction-column">
            <p className="font-bold text-lg">自选列表</p>
            <div className="mt-4 flex-wrap gap-5">
              {(marketStore.watchList || []).map((w: Record<string, any> = {}) => {
                return (
                  <div
                    className="border rounded-lg flex-direction-column w-[300px] p-4 bg-line-hover hover:shadow-md select-none"
                    key={w.id || ''}
                    onClick={() => {
                      const type = w.fundType || '' // 类型: etf | fund | stock
                      const market = w.market || '' // 市场: ab | hk | us | sg
                      const exchange = w.exchange || ''
                      homeStore.selectedMenu = `${RouterUrls.MARKET.KEY || ''}-${homeStore.MENU_LIST[2].key || ''}`
                      navigate(
                        `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.DETAIL.URL}/${w.fundCode || ''}?code=${w.fundCode || ''}&type=${type || ''}&market=${market || ''}&exchange=${exchange || ''}`
                      )
                    }}
                  >
                    <div className="flex">
                      <p className="font-bold">{w.fundName || ''}</p>
                      <p className="ml-1 red rounded-md text-xs pt-0.5 pb-0.5 pl-1 pr-1">
                        {(w.fundType || '').toUpperCase()}
                      </p>
                    </div>
                    <div className="flex-align-center mt-1">
                      <p className="exchange-tag rounded-md text-xs pt-0.5 pb-0.5 pl-1 pr-1">{w.exchange || ''}</p>
                      <p className="color-gray ml-1 text-xs">{w.fundCode || ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(Dashboard)
