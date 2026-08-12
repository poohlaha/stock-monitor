/**
 * @fileOverview home store
 * @date 2023-07-03
 * @author poohlaha
 */
import { observable, action, makeObservable } from 'mobx'
import BaseStore from '../base/base.store'
import { lazy } from 'react'
import RouterUrls from '@route/router.url.toml'
import React from 'react'
import Utils from '@utils/utils'
import { ADDRESS } from '@utils/base'
import { SYSTEM } from '@config/index'

class HomeStore extends BaseStore {
  // 选中的菜单
  @observable selectedMenuKeys: Array<string> = []

  // 用户信息
  @observable userInfo: { [K: string]: any } = {}

  readonly MENU_LIST: Array<{ [K: string]: any }> = [
    {
      key: RouterUrls.DASHBOARD.KEY,
      label: RouterUrls.DASHBOARD.NAME,
      url: RouterUrls.DASHBOARD.URL,
      parentUrl: '',
      icon: (
        <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="currentColor"
            d="M902.016 130.016H123.008q-23.008 0-40 16.992t-16.992 40v480q0 24 16.992 40.512t40 16.512H480v108h-147.008q-12.992 0-22.496 9.504t-9.504 22.496 9.504 22.016 22.496 8.992h358.016q12.992 0 22.496-8.992t9.504-22.016-9.504-22.496-22.496-9.504h-148v-108h359.008q24 0 40.512-16.512t16.512-40.512v-480q0-23.008-16.512-40t-40.512-16.992zM896 192.992v468H128.992V192.992H896z"
          ></path>
        </svg>
      ),
      component: lazy(() => import(/* webpackChunkName:'dashboard' */ '@views/pages/dashboard'))
    },
    {
      key: RouterUrls.MARKET.KEY,
      label: RouterUrls.MARKET.NAME,
      url: RouterUrls.MARKET.URL,
      parentUrl: '',
      icon: (
        <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M608.995556 637.155556a26.88 26.88 0 0 1 20.48 8.248888 28.444444 28.444444 0 0 1 7.68 21.048889V782.222222a28.444444 28.444444 0 0 1-56.888889 0v-115.768889a28.444444 28.444444 0 0 1 7.822222-21.333333 27.306667 27.306667 0 0 1 20.906667-7.964444zM230.684444 512a21.191111 21.191111 0 0 0 17.351112-5.973333l188.302222-182.044445 102.684444 96.853334a28.444444 28.444444 0 0 0 40.248889 0l176.782222-170.666667V284.444444a45.226667 45.226667 0 0 0 11.946667 22.755556 28.444444 28.444444 0 0 0 22.755556 11.377778 26.453333 26.453333 0 0 0 19.911111-7.822222 27.306667 27.306667 0 0 0 7.964444-20.906667v-101.831111c0-22.755556-5.973333-28.444444-22.897778-28.444445H682.666667a27.164444 27.164444 0 0 0-28.444445 28.444445 27.022222 27.022222 0 0 0 28.444445 28.444444h28.444444L561.92 364.088889l-102.826667-96.426667a27.306667 27.306667 0 0 0-39.68 0L213.333333 466.346667a27.164444 27.164444 0 0 0 0 39.537777c0 6.115556 11.377778 6.115556 17.351111 6.115556z m559.928889 11.52a26.737778 26.737778 0 0 0-20.622222 8.106667 28.444444 28.444444 0 0 0-7.68 20.906666V782.222222a28.444444 28.444444 0 0 0 56.888889 0V552.391111c-5.973333-17.493333-16.782222-29.013333-28.586667-29.013333zM398.222222 491.52v284.444444a28.444444 28.444444 0 1 0 56.888889 0v-284.444444a28.444444 28.444444 0 0 0-56.888889 0zM941.937778 910.222222H142.222222a27.306667 27.306667 0 0 1-20.906666-7.68A26.88 26.88 0 0 1 113.777778 881.777778V85.333333a26.453333 26.453333 0 0 0-7.68-20.622222A27.306667 27.306667 0 0 0 85.333333 56.888889a28.444444 28.444444 0 0 0-20.906666 7.822222A26.737778 26.737778 0 0 0 56.888889 85.333333v824.888889a53.76 53.76 0 0 0 56.888889 56.888889h828.16a28.444444 28.444444 0 0 0 0-56.888889z m-725.333334-301.084444v170.666666a28.444444 28.444444 0 1 0 56.888889 0v-170.666666a27.022222 27.022222 0 0 0-28.444444-28.444445 26.88 26.88 0 0 0-28.444445 28.444445z"
            fill="currentColor"
          ></path>
        </svg>
      ),
      component: lazy(() => import(/* webpackChunkName:'market' */ '@views/pages/market')),
      children: [
        {
          key: `${RouterUrls.MARKET.KEY}-${RouterUrls.MARKET.DETAIL.KEY}`,
          label: RouterUrls.MARKET.DETAIL.NAME,
          url: RouterUrls.MARKET.DETAIL.URL,
          icon: null,
          component: lazy(() => import(/* webpackChunkName:'marketDetail' */ '@pages/market/detail/index'))
        },
        {
          key: `${RouterUrls.MARKET.KEY}-${RouterUrls.MARKET.NEWS.KEY}`,
          label: RouterUrls.MARKET.NEWS.NAME,
          url: RouterUrls.MARKET.NEWS.URL,
          icon: null,
          component: lazy(() => import(/* webpackChunkName:'marketDetailNews' */ '@pages/market/detail/news'))
        }
      ]
    },
    {
      key: RouterUrls.SETTING.SYSTEM.KEY,
      label: RouterUrls.SETTING.SYSTEM.NAME,
      url: RouterUrls.SETTING.SYSTEM.URL,
      icon: null,
      component: lazy(() => import(/* webpackChunkName:'setting' */ '@views/pages/setting/system'))
    }
  ]

  @observable breadcrumbItems: Array<{ [K: string]: any }> = [] // 面包屑

  @observable selectedMenu: string = this.MENU_LIST[0].key

  constructor() {
    super()
    makeObservable(this)
    // this.getSelectMenuByUrl()
  }

  /**
   * 根据 url 获取选中的 key
   */
  @action
  getSelectMenuByUrl() {
    let { addressUrl } = ADDRESS.getAddress()
    console.log('addressUrl', addressUrl)
    if (Utils.isBlank(addressUrl || '') || addressUrl === '/') {
      this.selectedMenu = RouterUrls.DASHBOARD.KEY
      return
    }

    if (addressUrl === RouterUrls.SETTING.SYSTEM.URL) {
      this.selectedMenu = RouterUrls.SETTING.SYSTEM.KEY
      return
    }

    // 根据key查找url
    let obj = this.findMenu(this.MENU_LIST || [], '', addressUrl) || {}
    if (!Utils.isObjectNull(obj || {})) {
      this.selectedMenu = obj.key
      return
    }

    this.selectedMenu = ''
  }

  /**
   * 获取选中的菜单
   */
  @action
  getSelectedKeysByUrl() {
    const list = this.MENU_LIST || []
    if (list.length === 0) return []

    let { addressUrl } = ADDRESS.getAddress()
    console.log('addressUrl', addressUrl)

    // dashboard
    if (addressUrl === RouterUrls.DASHBOARD.URL || Utils.isBlank(addressUrl || '')) {
      this.selectedMenuKeys = [RouterUrls.DASHBOARD.KEY]
      return
    }

    // 如果有三层 /, 去掉最后一层
    if (addressUrl.endsWith('/')) {
      addressUrl = addressUrl.substring(0, addressUrl.length - 1)
    }

    let moreSplit = addressUrl.split('/').filter(Boolean).length > 2
    let path = addressUrl
    if (moreSplit) {
      path = addressUrl.substring(0, addressUrl.lastIndexOf('/'))
    }

    let obj = this.findMenu(this.MENU_LIST, '', path) || {}
    this.selectedMenuKeys.push(obj.key || '')
  }

  /**
   * 查找菜单
   */
  findMenu(list: Array<{ [K: string]: any }> = [], key: string = '', url: string = ''): { [K: string]: any } {
    if (list.length === 0) return {}

    for (const item of list) {
      if (item.key === key || (item.url === url && !Utils.isBlank(url || ''))) {
        return item || {}
      }

      const children = item.children || []
      if (children.length === 0) {
        continue
      }

      let obj = this.findMenu(children, key, url) || {}
      if (!Utils.isObjectNull(obj || {})) {
        return obj
      }
    }

    return {}
  }

  // 直接根据 url 查找
  getUrl(needParams: boolean = true) {
    let relativePath = this.getRelativePath(window.location.href || '')
    relativePath = relativePath.replace(RouterUrls.HOME_URL, '')
    if (!needParams) {
      let index = relativePath.indexOf('?')
      if (index !== -1) {
        relativePath = relativePath.substring(0, index)
      }
    }

    return relativePath
  }

  @action
  reset() {
    this.breadcrumbItems = []
  }

  @action
  onSetSelectMenu(key: string = '') {
    this.selectedMenu = key || ''
    Utils.setLocal(SYSTEM.LEFT_MENU_NAME, this.selectedMenu)
  }

  onGetSelectMenu() {
    this.selectedMenu = Utils.getLocal(SYSTEM.LEFT_MENU_NAME) || ''
  }

  /**
   * 重置数据
   */
  @action
  onReset() {
    this.selectedMenuKeys = []
    this.userInfo = {}
  }
}

export default new HomeStore()
