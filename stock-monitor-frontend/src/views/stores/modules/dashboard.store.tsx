/**
 * @fileOverview dashboard store
 * @date 2023-07-05
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { action, makeObservable, observable } from 'mobx'
import { invoke } from '@tauri-apps/api/core'
import { TOAST } from '@utils/base'

class DashboardStore extends BaseStore {
  @observable watchList: Array<Record<string, any>> = []

  constructor() {
    super()
    makeObservable(this)
  }

  /**
   * 查找自选列表
   */
  @action
  async onGetWatchList() {
    try {
      let result: { [K: string]: any } = await invoke('query_watchlist', {})

      this.watchList = this.handleResult(result) || []
    } catch (e: any) {
      TOAST.show({ message: `查找自选列表失败: ${e}`, type: 4 })
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 重置
   */
  @action
  onReset() {}
}

export default new DashboardStore()
