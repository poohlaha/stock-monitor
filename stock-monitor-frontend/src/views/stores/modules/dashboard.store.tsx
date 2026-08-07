/**
 * @fileOverview dashboard store
 * @date 2023-07-05
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { action, makeObservable, observable } from 'mobx'
import { invoke } from '@tauri-apps/api/core'
import { TOAST } from '@utils/base'
import Utils from '@utils/utils'

class DashboardStore extends BaseStore {
  readonly SEARCH_OPTIONS = [
    {
      label: '基金',
      value: '1',
      placeholder: '请输入基金代码、名称或简拼'
    },
    {
      label: '基金经理',
      value: '7',
      placeholder: '例: 请输入“王宁”或“wm”'
    },
    {
      label: '基金公司',
      value: '8',
      placeholder: '例: 请输入“华夏”或“hx”'
    }
  ]

  @observable search: Record<string, any> = {
    placeholder: '请输入名称或代码',
    selected: this.SEARCH_OPTIONS[0].value,
    name: '',
    list: []
  }

  @observable showSearchDialog: boolean = false

  constructor() {
    super()
    makeObservable(this)
  }

  /**
   * 搜索
   */
  @action
  async onSearch() {
    try {
      this.showSearchDialog = true
      this.loading = true
      let result: { [K: string]: any } = await invoke('search', {
        args: { name: this.search.name || '', value: this.search.value || '' }
      })

      this.loading = false
      const search = this.handleResult(result) || {}
      const searchList = search.list || []
      const fundCodes = (searchList || []).map((item: Record<string, any> = {}) => item.code) || []
      console.log('on search fund codes:', fundCodes)
      if (fundCodes.length > 0) {
        await this.onGetMyFundListByCodes(fundCodes, (list: Array<Record<string, any>> = []) => {
          this.search.list = (searchList || []).map((item: Record<string, any> = {}) => {
            return {
              ...item,
              hasCollect: !Utils.isObjectNull(
                (list || []).find((l: Record<string, any> = {}) => l.fundCode === item.code) || {}
              )
            }
          })
        })
      } else {
        this.search.list = searchList || []
      }
      console.log('on search result:', this.search.list)
    } catch (e: any) {
      this.loading = false
      TOAST.show({ message: `搜索数据失败: ${e}`, type: 4 })
      throw new Error(e)
    }
  }

  /**
   * 根据基金代码批量查找基金列表
   */
  @action
  async onGetMyFundListByCodes(fundCodes: Array<string>, callback?: Function) {
    try {
      let result: { [K: string]: any } = await invoke('find_by_fund_codes', {
        fundCodes: fundCodes || []
      })

      const list = this.handleResult(result) || []
      callback?.(list)
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 添加到我的自选
   */
  @action
  async onAddToMyFundWatchlist(item: Record<string, any> = {}, callback?: Function) {
    try {
      let result: { [K: string]: any } = await invoke('add_to_my_fund_watchlist', {
        args: {
          fundCode: item.CODE || '',
          fundName: item.NAME || ''
        }
      })

      this.handleResult(result)
      this.search.list = (this.search.list || []).map((v: Record<string, any> = {}) => {
        return {
          ...v,
          hasCollect: item.CODE === v.CODE
        }
      })
      callback?.()
    } catch (e: any) {
      TOAST.show({ message: `添加到我的自选列表失败: ${e}`, type: 4 })
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 重置
   */
  @action
  onReset() {
    this.search = {
      placeholder: this.SEARCH_OPTIONS[0].placeholder || '',
      selected: this.SEARCH_OPTIONS[0].value,
      name: '',
      list: []
    }

    this.showSearchDialog = false
  }
}

export default new DashboardStore()
