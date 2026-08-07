/**
 * @fileOverview my store
 * @date 2023-07-03
 * @author poohlaha
 */
import { observable, action, makeObservable } from 'mobx'
import BaseStore from '../base/base.store'
import { invoke } from '@tauri-apps/api/core'

class MyStore extends BaseStore {
  @observable list: Array<Record<string, any>> = []

  constructor() {
    super()
    makeObservable(this)
  }

  /**
   * 获取服务器列表
   */
  @action
  async getList() {
    try {
      this.loading = true
      let result: { [K: string]: any } = (await invoke('get_my_fund_list', {})) || {}
      this.loading = false
      let data = this.handleResult(result) || []
      this.list = (data || []).map((item: { [K: string]: any } = {}, index: number) => {
        return { ...item, key: index + 1, label: item.name || '', value: item.id || '' }
      })
      console.log('get my fund list:', result)
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }
}

export default new MyStore()
