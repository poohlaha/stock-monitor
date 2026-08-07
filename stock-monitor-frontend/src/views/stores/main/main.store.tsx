/**
 * @fileOverview main store
 * @date 2023-07-03
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { makeObservable } from 'mobx'

class MainStore extends BaseStore {
  constructor() {
    super()
    makeObservable(this)
  }
}

export default new MainStore()
