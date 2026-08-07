/**
 * @fileOverview timeline store
 * @date 2023-07-03
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { action, makeObservable, observable } from 'mobx'
import { invoke } from '@tauri-apps/api/core'
import Utils from '@utils/utils'

class MarketStore extends BaseStore {
  @observable timelineList: Array<any> = [] // 分时图数据
  @observable klineList: Array<any> = [] // 日K图数据
  @observable weekList: Array<any> = [] // 周K图数据
  @observable monthList: Array<any> = [] // 月K图数据

  @observable basicInfo: Record<string, any> = {} // 基本信息
  @observable marketInfo: Record<string, any> = {}
  @observable briefInfo: Record<string, any> = {} // 间况
  @observable pankouInfo: Record<string, any> = {} // 盘口信息
  @observable positionDistributionInfo: Record<string, any> = {} // 持仓信息
  @observable xLabels: Array<string> = [] // x 轴标签
  @observable incomeList: Array<any> = [] // 收益率
  @observable preClosePrice: number = 0 // 收盘价
  readonly checkTradeSchedule: Array<string> = ['09:30', '11:30', '13:00', '15:00']

  @observable isTrade: boolean = false

  constructor() {
    super()
    makeObservable(this)
  }

  /**
   * 查询交易状态
   */
  @action
  async getMarketStatus() {
    try {
      let result: { [K: string]: any } = (await invoke('query_market_status', {})) || {}
      let data = this.handleResult(result) || {}
      this.marketInfo = data || {}
      console.log('market info: ', data || {})
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 查询持仓
   */
  @action
  async queryPositionDistribution(code: string = '', market: string = '', type: string = '', callback?: Function) {
    try {
      let result: { [K: string]: any } =
        (await invoke('query_position_distribution', {
          args: {
            code,
            market,
            type,
            queryType: '',
            ktype: ''
          }
        })) || {}

      let data = this.handleResult(result) || {}
      const content = (data || {}).content || []

      this.positionDistributionInfo = {
        industry:
          ((content.find((c: Record<string, any> = {}) => c.enCategory === 'industry') || {}).list || {}).body || [], // 行业
        asset: ((content.find((c: Record<string, any> = {}) => c.enCategory === 'asset') || {}).list || {}).body || [] // 资产配置
      }

      console.log('position distribution info: ', this.positionDistributionInfo)
      callback?.()
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 获取收益率
   */
  @action
  async onGetIncome(code: string = '', market: string = '', type: string = '') {
    try {
      let result: { [K: string]: any } =
          (await invoke('query_income', {
            args: {
              code,
              market,
              type,
              queryType: '',
              ktype: ''
            }
          })) || {}

      let data = this.handleResult(result) || {}
      const content = ((data || {}).content || {}).gradeInfo || {}
      this.incomeList = content.performance || []
      console.log('incomeList: ', content.performance || [])
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 获取简况
   */
  async onGetBrief(code: string = '', market: string = '', type: string = '') {
    try {
      let result: { [K: string]: any } =
        (await invoke('query_brief', {
          args: {
            code,
            market,
            type,
            queryType: '',
            ktype: ''
          }
        })) || {}
      let data = this.handleResult(result) || {}
      this.briefInfo = (data || {}).basicinfo || {}
      console.log('brief info: ', this.briefInfo)
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 判断是不是交易中
   */
  async onJudgeIsTrade(market: string = '') {
    if (Utils.isBlank(market || '')) {
      return {}
    }

    const result = await this.getMarketStatus()
    const marketInfo = this.marketInfo || {}
    if (Utils.isObjectNull(marketInfo || {})) {
      return {}
    }

    const stock = marketInfo.stock || {}
    const futures = marketInfo.futures || {}
    const m = stock[market.toLowerCase()] || {}
    if (Utils.isObjectNull(m || {})) {
      return {}
    }

    const f = futures[market.toLowerCase()] || {}
    if (Utils.isObjectNull(f || {})) {
      this.isTrade = m.tradeStatus === 'TRADE'
    } else {
      this.isTrade = m.tradeStatus === 'TRADE' || f.tradeStatus === 'TRADE'
    }

    this.isTrade = m.tradeStatus === 'TRADE'
    return result || {}
  }

  /**
   * 获取行情数据
   */
  @action
  async getTimelineData(code: string = '', market: string = '', type: string = '') {
    try {
      let result: { [K: string]: any } =
        (await invoke('get_time_data', {
          args: {
            code,
            market,
            type,
            queryType: 'minute',
            ktype: ''
          }
        })) || {}
      let data = this.handleResult(result) || {}

      // 基本信息
      this.basicInfo = {
        ...(data.basicinfos || {}),
        ...(data.cur || {}),
        ...(data.update || {})
      }

      // 盘口信息
      const pankouList = (data.pankouinfos || {}).list || []
      this.pankouInfo = {
        open: pankouList.find((l: Record<string, any> = {}) => l.ename === 'open') || {}, // 今开
        high: pankouList.find((l: Record<string, any> = {}) => l.ename === 'high') || {}, // 最高
        volume: pankouList.find((l: Record<string, any> = {}) => l.ename === 'volume') || {}, // 成交量
        capitalization: pankouList.find((l: Record<string, any> = {}) => l.ename === 'capitalization') || {}, // 总市值
        preClose: pankouList.find((l: Record<string, any> = {}) => l.ename === 'preClose') || {}, // 昨收
        low: pankouList.find((l: Record<string, any> = {}) => l.ename === 'low') || {}, // 最低
        amount: pankouList.find((l: Record<string, any> = {}) => l.ename === 'amount') || {}, // 成交额
        totalShareCapital: pankouList.find((l: Record<string, any> = {}) => l.ename === 'totalShareCapital') || {}, // 总股本
        w52High: pankouList.find((l: Record<string, any> = {}) => l.ename === 'w52_high') || {}, // 52周高
        amplitudeRatio: pankouList.find((l: Record<string, any> = {}) => l.ename === 'amplitudeRatio') || {}, // 振幅
        volumeRatio: pankouList.find((l: Record<string, any> = {}) => l.ename === 'volumeRatio') || {}, // 量比
        turnoverRatio: pankouList.find((l: Record<string, any> = {}) => l.ename === 'turnoverRatio') || {}, // 换手率
        w52Low: pankouList.find((l: Record<string, any> = {}) => l.ename === 'w52_low') || {}, // 52周低
        inside: pankouList.find((l: Record<string, any> = {}) => l.ename === 'inside') || {}, // 内盘
        outside: pankouList.find((l: Record<string, any> = {}) => l.ename === 'outside') || {}, // 外盘
        peratio: pankouList.find((l: Record<string, any> = {}) => l.ename === 'peratio') || {}, // 市盈(TTM)
        lyr: pankouList.find((l: Record<string, any> = {}) => l.ename === 'lyr') || {} // 市盈(静)
      }

      // 分时图数据
      this.getTimeData(data.newMarketData || {})
      this.preClosePrice = Number((this.pankouInfo?.preClose || {}).value || '0')
      this.loading = false
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 获取其他分时图数据
   */
  async onGetOtherTimelineData(
    code: string = '',
    market: string = '',
    type: string = '',
    queryType: string = '',
    ktype: string = ''
  ) {
    try {
      let result: { [K: string]: any } =
        (await invoke('get_time_data', {
          args: {
            code,
            market,
            type,
            queryType,
            ktype
          }
        })) || {}
      let data = this.handleResult(result) || {}

      // 五日数据
      if (queryType === 'fiveday') {
        this.onGetFiveData(data.newMarketData || {})
      }

      // 日K数据
      if (queryType === 'kline') {
        let list = []
        if (ktype === 'day') {
          // @ts-ignore
          this.klineList = this.onGetKlineData(data.newMarketData || {})
          list = this.klineList || []
        }

        if (ktype === 'week') {
          // @ts-ignore
          this.weekList = this.onGetKlineData(data.newMarketData || {})
          list = this.weekList || []
        }

        if (ktype === 'month') {
          // @ts-ignore
          this.monthList = this.onGetKlineData(data.newMarketData || {})
          list = this.monthList || []
        }

        if (list.length > 0) {
          this.preClosePrice = list[list.length - 1].close || 0
        }
      }

      this.loading = false
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 获取分时图数据
   */
  getTimeData(data: Record<string, any> = {}) {
    if (Utils.isObjectNull(data || {})) {
      return
    }

    const marketData = data.marketData || []
    if (marketData.length === 0) {
      return
    }

    const str = (marketData[0] || {}).p || ''
    if (Utils.isBlank(str || '')) {
      return
    }

    this.xLabels = []
    // @ts-ignore
    this.timelineList = this.onGetTimeResult(str) || []
  }

  /**
   * 获取五日数据
   */
  onGetFiveData(data: Record<string, any> = {}) {
    if (Utils.isObjectNull(data || {})) {
      return
    }

    const marketData = data.marketData || []
    if (marketData.length === 0) {
      return
    }

    this.xLabels = data.cx || []

    let list: Array<any> = []
    for (let m of marketData) {
      list = list.concat(this.onGetTimeResult(m.p || '') || [])
    }

    this.timelineList = list || []
    if (list.length > 0) {
      this.preClosePrice = list[list.length - 1].price || 0
    }
  }

  /**
   * 获取日K数据
   */
  onGetKlineData(data: Record<string, any> = {}) {
    if (Utils.isObjectNull(data || {})) {
      return
    }

    this.xLabels = []

    return this.onGetKlineResult(data.marketData || '') || []
  }

  /**
   * 解析日K结果
   */
  onGetKlineResult(str: string = '') {
    return str
      .split(';')
      .map(item => {
        const arr = item.split(',')

        if (arr.length < 11) {
          return null
        }

        return {
          timestamp: Number(arr[0]) * 1000,
          open: Number(arr[2]),
          close: Number(arr[3]),
          volume: Number(arr[4]),
          high: Number(arr[5]),
          low: Number(arr[6]),
          turnover: Number(arr[7]),
          riseFall: Number(arr[8]),
          amplitude: Number(arr[9]),
          floatShare: arr[10]
        }
      })
      .filter(Boolean)
  }

  /**
   * 获取时间数据
   */
  onGetTimeResult(str: string = '') {
    if (Utils.isBlank(str || '')) {
      return []
    }

    let list = str
      .split(';')
      .map((item: string = '') => {
        const arr = item.split(',') || []
        if (arr.length === 0) {
          return {}
        }

        return {
          timestamp: Number(arr[0]) * 1000, // 接口是秒，需要转毫秒
          price: Number(arr[2]), // 当前价格
          volume: Number(arr[6]), // 成交量
          turnover: Number(arr[7]), // 成交额
          riseFall: arr[4], // 涨跌额
          amplitude: Number(arr[5]) // 涨跌幅
        }
      })
      .filter((item: any) => {
        if (!item.timestamp) {
          return false
        }

        const date = new Date(item.timestamp)
        const hour = date.getHours()
        const minute = date.getMinutes()

        // 只保留 09:30 - 15:00
        return hour < 15 || (hour === 15 && minute === 0)
      })

    return list.filter((l: Record<string, any> = {}) => !Utils.isObjectNull(l || {})) || []
  }
}

export default new MarketStore()
