/**
 * @fileOverview dashboard store
 * @date 2023-07-05
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { action, makeObservable } from 'mobx'

class DashboardStore extends BaseStore {
  constructor() {
    super()
    makeObservable(this)
  }

  /**
   * 重置
   */
  @action
  onReset() {}
}

export default new DashboardStore()
