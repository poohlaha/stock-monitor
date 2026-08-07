/**
 * @fileOverview login store
 * @date 2023-07-03
 * @author poohlaha
 */
import { action, makeObservable } from 'mobx'
import BaseStore from '../base/base.store'

class LoginStore extends BaseStore {
  constructor() {
    super()
    makeObservable(this)
  }

  /**
   * 登录
   */
  @action
  // @ts-ignore
  async onLogin(callback?: Function, failed?: Function) {}

  /**
   * 登出
   */
  @action
  // @ts-ignore
  async onLogout(callback?: Function) {}
}

export default new LoginStore()
