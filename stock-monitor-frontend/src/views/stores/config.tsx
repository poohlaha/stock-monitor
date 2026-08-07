/**
 * @fileOverview store
 * @date 2023-04-12
 * @author poohlaha
 */
import commonStore from './base/common.store'
import homeStore from './main/home.store'
import dashboardStore from './modules/dashboard.store'
import mainStore from './main/main.store'
import systemStore from './setting/system.store'
import myStore from './my/my.store'
import marketStore from './market/market.store'

export function createStore() {
  return {
    commonStore,
    homeStore,
    dashboardStore,
    mainStore,
    systemStore,
    myStore,
    marketStore
  }
}

export const store = createStore()
export type Stores = ReturnType<typeof createStore>
