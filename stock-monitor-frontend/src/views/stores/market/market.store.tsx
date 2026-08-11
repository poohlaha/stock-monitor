/**
 * @fileOverview timeline store
 * @date 2023-07-03
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { action, makeObservable, observable } from 'mobx'
import { invoke } from '@tauri-apps/api/core'
import Utils from '@utils/utils'
import { TOAST } from '@utils/base'

class MarketStore extends BaseStore {
  @observable timelineList: Array<any> = [] // 分时图数据
  @observable klineList: Array<any> = [] // 日K图数据
  @observable weekList: Array<any> = [] // 周K图数据
  @observable monthList: Array<any> = [] // 月K图数据

  @observable basicInfo: Record<string, any> = {} // 基本信息
  @observable marketInfo: Record<string, any> = {}
  @observable briefInfo: Record<string, any> = {} // 间况
  @observable openDataInfo: Record<string, any> = {} // 间况
  @observable pankouInfo: Record<string, any> = {} // 盘口信息
  @observable tagList: Array<Record<string, any>> = [] // 行业标签
  @observable positionDistributionInfo: Record<string, any> = {} // 持仓信息
  @observable xLabels: Array<string> = [] // x 轴标签
  @observable incomeList: Array<any> = [] // 收益率
  @observable preClosePrice: number = 0 // 收盘价
  @observable worldwide: Record<string, any> = {} // 全球市场数据
  @observable worldwideMarket: Record<string, any> = {} // 行情中心(全球)
  @observable otherMarket: Record<string, any> = {} // A股、港股等行情
  @observable industrialChainMarket: Array<Record<string, any>> = [] // 产业链
  @observable economicIndicators: Record<string, any> = {} // 主要经济指标
  @observable hotIndicators: Record<string, any> = {} // 热门指标
  @observable watchList: Array<Record<string, any>> = [] // 我的自选列表
  @observable performanceGraph: Array<Record<string, any>> = []
  @observable networthGraph: Array<Record<string, any>> = []
  @observable industryFundFlow: Record<string, any> = {}

  readonly checkTradeSchedule: Array<string> = ['09:30', '11:30', '13:11', '15:00']

  @observable isTrade: boolean = false
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
          fundName: item.NAME || '',
          market: item.market || '',
          exchange: item.exchange || '',
          fundType: item.type || ''
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

  // 获取基本信息
  @action
  getBasicData(openDataInfo: Record<any, any> = {}) {
    const result = ((openDataInfo || {}).tplData || {}).result || {}
    if (Utils.isObjectNull(result || {})) {
      return {
        recent: [],
        fundManager: {},
        brief: {} as Record<string, any>,
        position: {},
        tas: [],
        name: '',
        result: {}
      }
    }

    const recent = result.recent || {} // 涨幅

    // 基金经理
    const fundMangerList = result.fundMangerList || []
    const fundManager = fundMangerList.length > 0 ? fundMangerList[0] || {} : {}

    const content = result.content || {}

    const tabs = content.tabs || []

    const briefList =
      ((((tabs || []).find((t: Record<string, any> = {}) => t.type === 'view') || {}).content || {}).basicInfo || {})
        .list || []
    let brief: Record<string, any> = {}
    const newest = result.newest || []

    // 基本信息
    if (briefList.length > 0) {
      const lastNumObj = (briefList || []).find((l: Record<string, any> = {}) => l.text === '最新规模') || {}
      brief = {
        // type: ((briefList || []).find((l: Record<string, any> = {}) => l.text === '基金类型') || {}).value || '',
        newest: (newest || []).find((l: Record<string, any> = {}) => l.text === '净值').value || '',
        publishDate: ((briefList || []).find((l: Record<string, any> = {}) => l.text === '成立日期') || {}).value || '',
        lastNum: `${lastNumObj.value || '-'}(${lastNumObj.date || '-'})`,
        company: ((briefList || []).find((l: Record<string, any> = {}) => l.text === '基金公司') || {}).value || '',
        primaryAdvisor:
          ((briefList || []).find((l: Record<string, any> = {}) => l.text === '基金托管人') || {}).value || '',
        info: ((briefList || []).find((l: Record<string, any> = {}) => l.text === '投资策略') || {}).value || '',
        fullName: ((briefList || []).find((l: Record<string, any> = {}) => l.text === '基金全称') || {}).value || '',
        code: ((briefList || []).find((l: Record<string, any> = {}) => l.text === '基金代码') || {}).value || ''
      }
    }

    // 持仓股票/债券
    const position =
      ((tabs || []).find((t: Record<string, any> = {}) => t.type === 'position') || {} || {}).content || {}

    // 标签
    const tagDescriptions = result.tagDescriptions || []
    return {
      recent,
      fundManager,
      brief,
      position,
      newest,
      tags: tagDescriptions || [],
      name: result.title || '',
      result
    }
  }

  /**
   * 获取十大持仓等数据
   */
  async onGetOpenData(code: string = '', callback?: Function, type: string = '') {
    try {
      let result: { [K: string]: any } =
        (await invoke('query_open_data', {
          code
        })) || {}
      let data = this.handleResult(result) || []
      if (data.length > 0) {
        this.openDataInfo = ((data[0] || {}).DisplayData || {}).resultData || {}
      }
      console.log('open data info: ', data)
      const openDataInfo = this.getBasicData(this.openDataInfo || {})

      let tabs = []
      if (type === 'fund') {
        tabs = openDataInfo.result?.tabs || []
        if (tabs.length > 0) {
          await this.onGetPNGraph(tabs[0].param || 'ai', code)
        }
      }

      callback?.(openDataInfo, tabs)

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
   * 查找自选列表
   */
  @action
  async onGetWatchList(needQueryMarketTrends: boolean = false, callback?: Function) {
    try {
      let result: { [K: string]: any } = await invoke('query_watchlist', {})
      this.watchList = this.handleResult(result) || []

      // 查询行情数据
      let hasAllInTrade = false
      if (needQueryMarketTrends) {
        for (let w of this.watchList) {
          // 查询是否在交易中
          let tradeResult: { [K: string]: any } = (await invoke('query_market_status', {})) || {}
          let tradeData = this.handleResult(tradeResult) || {}
          w.isTrade = this.onGetTrade(tradeData || {}, w.market || '')
          if (!hasAllInTrade) {
            hasAllInTrade = w.isTrade
          }

          // 获取分时图数据
          let klineResult: { [K: string]: any } =
            (await invoke('get_time_data', {
              args: {
                code: w.fundCode,
                market: w.market,
                type: w.fundType,
                queryType: 'minute',
                ktype: ''
              }
            })) || {}

          const klineData = this.handleResult(klineResult) || {}
          w.basicInfo = {
            ...(klineData.basicinfos || {}),
            ...(klineData.cur || {}),
            ...(klineData.update || {})
          }
          w.data = this.getTimeData(klineData.newMarketData || {})
          w.prices = w.data.map((item: Record<string, any> = {}) => Number(item.price))
        }
      }

      callback?.(hasAllInTrade)
    } catch (e: any) {
      TOAST.show({ message: `查找自选列表失败: ${e}`, type: 4 })
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 定时开启自选列表
   */
  @action
  async onGetWatchListTimer(callback?: Function) {
    try {
      let result: { [K: string]: any } = await invoke('query_watchlist', {})
      const watchList = this.handleResult(result) || []
      // 查询行情数据
      let hasAllInTrade = false

      // 根据市场查找是否在交易中
      let markets = (watchList || []).map((w: Record<any, any> = {}) => w.market) || []
      // @ts-ignore
      markets = [...new Set(markets)]
      if (markets.length === 0) {
        return
      }

      const marketTradeMap: Record<string, boolean> = {}
      let tradeResult: { [K: string]: any } = (await invoke('query_market_status', {})) || {}
      let tradeData = this.handleResult(tradeResult) || {}

      // 查询是否在交易中
      for (const market of markets) {
        marketTradeMap[market] = this.onGetTrade(tradeData || {}, market || '')
      }

      for (let w of watchList) {
        w.isTrade = marketTradeMap[w.market] ?? false
        if (!hasAllInTrade) {
          hasAllInTrade = w.isTrade
        }

        // 交易中
        if (w.isTrade) {
          // 获取分时图数据
          let klineResult: { [K: string]: any } =
            (await invoke('get_time_data', {
              args: {
                code: w.fundCode,
                market: w.market,
                type: w.fundType,
                queryType: 'minute',
                ktype: ''
              }
            })) || {}

          const klineData = this.handleResult(klineResult) || {}
          w.basicInfo = {
            ...(klineData.basicinfos || {}),
            ...(klineData.cur || {}),
            ...(klineData.update || {})
          }
          w.data = this.getTimeData(klineData.newMarketData || {})
          w.prices = w.data.map((item: Record<string, any> = {}) => Number(item.price))
        }
      }

      callback?.(hasAllInTrade)
    } catch (e: any) {
      TOAST.show({ message: `查找自选列表失败: ${e}`, type: 4 })
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
    this.isTrade = this.onGetTrade(this.marketInfo || {}, market)
    return result || {}
  }

  onGetTrade(result: Record<string, any> = {}, market: string = '') {
    if (Utils.isObjectNull(result || {})) {
      return false
    }

    const stock = result.stock || {}
    const futures = result.futures || {}
    const m = stock[market.toLowerCase()] || {}
    if (Utils.isObjectNull(m || {})) {
      return false
    }

    const f = futures[market.toLowerCase()] || {}
    if (Utils.isObjectNull(f || {})) {
      return m.tradeStatus === 'TRADE'
    } else {
      return m.tradeStatus === 'TRADE' || f.tradeStatus === 'TRADE'
    }

    return m.tradeStatus === 'TRADE'
  }

  /**
   * 获取行情数据
   */
  @action
  async getTimelineData(code: string = '', market: string = '', type: string = '') {
    if (Utils.isBlank(code || '')) {
      return
    }

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
        ...(data.update || {}),
        financeReport: {
          ...(data.financeReport || '')
        }
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

      // 行业标签
      this.tagList = data.tag_list || []

      // 分时图数据
      this.xLabels = []
      this.timelineList = this.getTimeData(data.newMarketData || {})
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
    if (Utils.isBlank(code || '')) {
      return
    }

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
      return []
    }

    const marketData = data.marketData || []
    if (marketData.length === 0) {
      return []
    }

    const str = (marketData[0] || {}).p || ''
    if (Utils.isBlank(str || '')) {
      return []
    }

    // @ts-ignore
    return this.onGetTimeResult(str) || []
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

  /**
   * 获取全球市场名称
   */
  async onGetWorldwideName(market: string = '', callback?: Function) {
    try {
      let result: { [K: string]: any } = (await invoke('query_worldwide', { market })) || {}
      let data = this.handleResult(result) || {}
      this.worldwide = data || {}
      if (!Utils.isObjectNull(this.worldwide || {})) {
        this.worldwide.tabs = (this.worldwide.tabs || []).map((w: Record<string, any> = {}) => {
          return {
            ...w,
            label: w.text || '',
            key: w.market || ''
          }
        })
      }

      console.log('worldwide: ', this.worldwide)
      callback?.(data.curtab || '')
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 获取行情中心(全球)
   */
  async onGetWorldwideMarketCenter(callback?: Function) {
    try {
      let result: { [K: string]: any } = (await invoke('query_worldwide_market_center', {})) || {}
      let data = this.handleResult(result) || {}
      if (data.length > 0) {
        this.worldwideMarket = (data[0] || {}).TplData?.result || {}
      } else {
        this.worldwideMarket = {}
      }

      console.log('worldwide market: ', this.worldwideMarket)
      callback?.(this.worldwideMarket?.hot_index_code || '')
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 获取A股、港股等行情
   */
  async onGetOtherMarketCenter(market: string = '') {
    try {
      let result: { [K: string]: any } = (await invoke('query_other_market_center', { market })) || {}
      let data = this.handleResult(result) || {}
      console.log('other worldwide market: ', data)
      if (data.length > 0) {
        this.otherMarket = (data[0] || {}).blocks || []
      } else {
        this.otherMarket = {}
      }

      console.log('other worldwide market2: ', this.otherMarket)
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 获取产业链
   */
  async onGetIndustrialChain(callback?: Function) {
    try {
      let result: { [K: string]: any } = (await invoke('query_industrial_chain', {})) || {}
      let data = this.handleResult(result) || {}
      if (!Utils.isObjectNull(data || {})) {
        this.industrialChainMarket = data.primaryIndustryChains || []
      } else {
        this.industrialChainMarket = []
      }

      let tabIndex = ''
      if (this.industrialChainMarket.length > 0) {
        tabIndex = this.industrialChainMarket[0].id || ''
      }

      callback?.(tabIndex)
      console.log('industrial chain: ', this.industrialChainMarket)
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 查询经济指标
   */
  async onGetEconomicIndicators() {
    try {
      let result: { [K: string]: any } = (await invoke('query_economic_indicators', {})) || {}
      this.economicIndicators = this.handleResult(result) || {}

      console.log('economic indicators: ', this.economicIndicators)
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 查询热门指标
   */
  async onGetHotIndicators(country: string = '') {
    try {
      let result: { [K: string]: any } = (await invoke('query_hot_indicators', { name: country })) || {}
      const data = this.handleResult(result) || {}
      if ((this.hotIndicators.tabs || []).length === 0) {
        this.hotIndicators.tabs = data.tabs || []
      }

      this.hotIndicators.list = data.list || []
      console.log('hot indicators: ', this.hotIndicators)
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 查询业绩走势和净值曲线
   */
  async onGetPNGraph(name: string = '', code: string = '', type: number = 0, month: string = '12') {
    try {
      let result: { [K: string]: any } =
        (await invoke('query_fund_graph', {
          name,
          code,
          month: Utils.isBlank(month || '') ? '12' : month
        })) || {}
      const data = this.handleResult(result) || []

      this.performanceGraph = []
      if (data.length === 0) {
        return
      }

      const series = ((((data[0] || {}).DisplayData || {}).resultData || {}).tplData || {}).series || []
      const newSeries = []

      for (let s of series) {
        const values = (s.value || '').split(';').filter(Boolean) || []

        let newValues = []
        if (type === 0) {
          newValues = values.map((item: string = '') => {
            const [date, value] = item.split(',')

            return {
              date,
              value: Number(value.replace('%', ''))
            }
          })
        } else {
          newValues = values.map((item: string = '') => {
            const [date, value1, value2, value3] = item.split(',')

            return {
              date,
              value1: Number(value1.replace('%', '')),
              value2: Number(value2.replace('%', '')),
              value3: Number(value3.replace('%', ''))
            }
          })
        }

        newSeries.push({
          name: (s.label || []).length > 0 ? s.label[0] || '' : '',
          type: 'line',
          smooth: false,
          symbol: 'none',
          data: newValues || []
        })
      }

      if (type === 0) {
        this.performanceGraph = newSeries || []
      } else {
        this.networthGraph = newSeries || []
      }

      console.log('newSeries: ', newSeries)
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  /**
   * 查询行业资金流向
   */

  async onGetIndustryFundFlow(code: string = '', market: string = '') {
    try {
      let result: { [K: string]: any } =
        (await invoke('query_industry_fund_flow', {
          args: {
            code,
            market,
            type: 'stock',
            queryType: '',
            ktype: ''
          }
        })) || {}
      const data = this.handleResult(result) || {}
      this.industryFundFlow = data.content || {}

      console.log('industry fund flow: ', this.industryFundFlow)
      return result || {}
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }
}

export default new MarketStore()
