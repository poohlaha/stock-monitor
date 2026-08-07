/**
 * @fileOverview tray store
 * @date 2023-07-03
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { action, makeObservable, observable } from 'mobx'
import { invoke } from '@tauri-apps/api/core'
import Utils from '@utils/utils'

class TrayStore extends BaseStore {
  @observable applicationList: Array<{ [K: string]: any }> = [] // 应用程序列表

  constructor() {
    super()
    makeObservable(this)
  }

  /**
   * 获取应用程序列表
   */
  @action
  async getApplicationList() {
    try {
      this.loading = true
      let result: { [K: string]: any } = (await invoke('get_application_list', {})) || {}
      this.loading = false
      let data = this.handleResult(result) || []
      this.applicationList = (data || []).map((item: { [K: string]: any } = {}, index: number) => {
        return { ...item, key: index + 1, label: item.name || '', value: item.id || '' }
      })
      console.log('get application list result:', this.applicationList)
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  @action
  async onKillApp(processIds: Array<number> = []) {
    if (processIds.length === 0) return

    try {
      this.loading = true
      let result: { [K: string]: any } = await invoke('kill_app', { pids: processIds || [] })

      this.loading = false
      console.log('kill app result:', result)
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 重置进程列表为空
   */
  @action
  onUpdateProcessList(path: string = '', processIds: Array<number> = []) {
    if (Utils.isBlank(path || '')) {
      return
    }

    this.applicationList.map((item: { [K: string]: any } = {}) => {
      if (item.path === path) {
        item.processIds = processIds || []
      }

      return { ...item }
    })
  }

  /**
   * 获取进程列表
   */
  @action
  async onGetProcessIds(name: string = '', path: string = '') {
    if (Utils.isBlank(name || '') && Utils.isBlank(path || '')) return

    try {
      this.loading = true
      let result: { [K: string]: any } = await invoke('get_app_process_id', { name, path })

      this.loading = false
      console.log('get app process ids result:', result)
      let data = this.handleResult(result) || []
      // 更新 process
      this.onUpdateProcessList(path, data)
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }
}

export default new TrayStore()
