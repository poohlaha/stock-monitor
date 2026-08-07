/**
 * @fileOverview base store, all store muse extends this store
 * @date 2023-04-12
 * @author poohlaha
 */
import { action, makeObservable, observable } from 'mobx'
import Utils from '@utils/utils'
import { COMMON, TOAST } from '@utils/base'

export default class BaseStore {
  readonly DEFAULT_PAGE_SIZE = 10
  readonly pageSizeOptions = [10, 20, 50, 100]
  readonly DOMAIN_PORT_REG = /^https?:\/\/[^\\/]+\/([^?#]+(\?[^#]*)?)?/

  @observable loading: boolean = false

  @observable pageSize: number = this.DEFAULT_PAGE_SIZE
  @observable total: number = 0
  @observable currentPage: number = 1

  @observable userId: string = '1f09cf1a-6359-4284-8a63-8e56ba0c30eb'

  constructor() {
    makeObservable(this)
  }

  /**
   * 获取相对路径
   */
  @action
  getRelativePath(url: string = '') {
    if (Utils.isBlank(url)) return ''
    const match = url.match(this.DOMAIN_PORT_REG)
    if (match) {
      let matchUrl = match[1] || ''
      if (matchUrl.startsWith('/')) {
        return matchUrl
      }

      return `/${matchUrl}`
    }

    return url || ''
  }

  /**
   * 设置属性
   */
  @action
  setProperty = (property: any, value: any) => {
    // @ts-ignore
    this[property] = value
  }

  /**
   * 获取属性
   */
  @action
  getProperty = (property: any) => {
    // @ts-ignore
    return this[property]
  }

  @action
  handleResult = (result: { [K: string]: any } = {}) => {
    if (Utils.isObjectNull(result)) {
      TOAST.show({ message: COMMON.getLanguageText('ERROR_MESSAGE'), type: 4 })
      return
    }

    let error = result.error || ''
    if (!Utils.isBlank(error) || result.code !== 200) {
      TOAST.show({ message: error || COMMON.getLanguageText('ERROR_MESSAGE'), type: 4 })
      return
    }

    return result.body
  }

  @action
  analysisResult = (result: { [K: string]: any } = {}, errMsg: string = '') => {
    if (Utils.isObjectNull(result)) {
      TOAST.show({ message: errMsg || COMMON.getLanguageText('ERROR_MESSAGE'), type: 4 })
      return {}
    }

    /*
    // 解除多次转义，将其还原为单次转义的 JSON 字符串
    let newData = data
      .replace(/^"/, '') // 去掉开头的双引号
      .replace(/"$/, '') // 去掉末尾的双引号
      .replace(/\\"/g, '"') // 将多次转义的双引号还原为单次转义的双引号

    newData = newData.replace(/\\n/g, '\n')
    console.log('newData: ', newData)
     */

    let error = result.error || ''
    if (!Utils.isBlank(error) || result.code !== 200) {
      TOAST.show({ message: errMsg || error || COMMON.getLanguageText('ERROR_MESSAGE'), type: 4 })
      return {}
    }

    let data = result.data || {}
    let originData = data.data || {}
    if (typeof originData === 'string') {
      originData = originData
        .replace(/^"/, '') // 去掉开头的双引号
        .replace(/"$/, '') // 去掉末尾的双引号
        .replace(/\\"/g, '"') // 将多次转义的双引号还原为单次转义的双引号

      originData = originData.replace(/\\n/g, '\n')
      console.log('origin data: ', originData)
    }

    return originData || {}
  }

  /**
   * 批量发送
   */
  @action
  async batchSend(queue: Array<any> = []) {
    if (queue.length === 0) {
      console.log('batch send queue is empty!')
      return []
    }

    let results = (await Promise.all(queue)) || []
    if (results.length === 0) return []

    let data: Array<any> = []
    for (let result of results) {
      if (result === null || result === undefined) {
        result = {}
      }
      let code = result.code
      let body = result.body || {}
      let errorMsg = body.error || body.codeInfo || COMMON.getLanguageText('ERROR_MESSAGE')
      if (code !== 200) {
        TOAST.show({ message: errorMsg, type: 4 })
        return []
      }

      let d = body.data
      let extendData = body.extendData
      data.push({
        data: d,
        extendData
      })
    }

    return data
  }

  /**
   * 页面大小重置
   */
  @action
  resize = (pageName: string = '') => {
    const dom = document.querySelector(`.${pageName || ''}`)
    if (!dom) return 0

    let totalHeight = dom.getBoundingClientRect().height
    // title
    const titleDom = document.querySelector('.page-title')
    let height = 0
    if (titleDom) {
      height += titleDom.getBoundingClientRect().height
    }

    // search
    const searchDom = document.querySelector('.page-search')
    if (searchDom) {
      height += searchDom.getBoundingClientRect().height
    }

    // pagination
    const paginationDom = document.querySelector('.page-pagination')
    if (paginationDom) {
      height += paginationDom.getBoundingClientRect().height
    }

    // tabs
    // pagination
    const tabsDom = document.querySelector('.ant-tabs-nav-wrap')
    if (tabsDom) {
      height += tabsDom.getBoundingClientRect().height
    }

    // table header
    const tableHeaderDom = document.querySelector('.ant-table-header')
    if (tableHeaderDom) {
      height += tableHeaderDom.getBoundingClientRect().height
    } else {
      height += 55 // 默认 55
    }

    let h = totalHeight - height
    if (h <= 0) {
      h = 0
    }

    return h
  }
}
