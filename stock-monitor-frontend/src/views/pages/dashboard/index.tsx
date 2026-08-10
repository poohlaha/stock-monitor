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

const Dashboard = (): ReactElement => {
  const { dashboardStore } = useStore()

  /*
  const navigate = useNavigate()

  const toPage = (index: number = 0) => {
    const menu = homeStore.MENU_LIST[index]
    homeStore.onSetSelectMenu(menu.key)
    navigate(`${menu.parentUrl || ''}${menu.url || ''}`)
  }
     */

  useMount(async () => {
    await dashboardStore.onGetWatchList()
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
              {(dashboardStore.watchList || []).map((w: Record<string, any> = {}) => {
                return (
                  <div
                    className="border rounded-lg flex-direction-column w-[220px] p-4 bg-line-hover hover:shadow-md"
                    key={w.id || ''}
                  >
                    <p className="font-bold">{w.fundName || ''}</p>
                    <p className="color-gray mt-1 text-xs">{w.fundCode || ''}</p>
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
