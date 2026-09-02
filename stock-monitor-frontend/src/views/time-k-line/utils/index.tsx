/**
 * @fileOverview 公共方法
 * @date 2023-08-28
 * @author poohlaha
 */
import { IShareHighestProps, IAxisProps } from '../types/share'
import { AxisDefaultProps, AxisTextOffset, XOffset } from '../types/default'
import dayjs from 'dayjs'

const Utils = {
  /**
   * 检验字符串是否为空
   */
  isBlank: (value: string) => {
    return (
      value === undefined || value == null || /^[ ]+$/.test(value) || value.length === 0 || value.trim().length === 0
    )
  },

  /**
   * 格式化成 万 / 亿
   * @param num
   */
  formatNumberUnit: (num: number): string => {
    if (Math.abs(num) >= 1e8) {
      return `${(num / 1e8).toFixed(2).replace(/\.00$/, '')}亿`
    } else if (Math.abs(num) >= 1e4) {
      return `${(num / 1e4).toFixed(2).replace(/\.00$/, '')}万`
    } else {
      return num.toString()
    }
  },

  /**
   * 格式化时间戳
   */
  formatTimestamp: (ts: number | string, format: string = 'YYYY-MM-DD HH:mm') => {
    let tsNum = typeof ts === 'string' ? Number(ts) : ts
    // 判断是秒级（10位）就乘 1000 转换为毫秒
    const correctedTs = tsNum < 1e12 ? tsNum * 1000 : tsNum
    return dayjs(correctedTs).format(format)
  },

  /**
   * 获取交易时间段, 拆分为每分钟
   */
  getTradingMinutes: (tradTimes: Array<string> = []) => {
    if (tradTimes.length === 0) {
      return []
    }

    // 时间转分
    const timeToMinute = (time: string, reduceOne: boolean = false) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m + (reduceOne ? 1 : 0)
    }

    // 获取分钟
    const getMinutes = (startMin: number, endMin: number) => {
      let minutes: Array<number> = []
      for (let m = startMin; m <= endMin; m++) {
        minutes.push(m)
      }

      return minutes
    }

    let minutes: Array<number> = []
    let hasReduceOne: boolean = false
    for (let i = 0; i < tradTimes.length; i++) {
      const time = tradTimes[i]
      let [start, end] = ['', '']
      if (time.indexOf('~') !== -1) {
        [start, end] = time.split('~') || []
      } else if (time.indexOf('-') !== -1) {
        [start, end] = time.split('-') || []
      } else {
        [start, end] = [time, time]
      }

      if (i > 0 && !hasReduceOne) {
        hasReduceOne = true
      } else {
        hasReduceOne = false
      }

      const startMin = timeToMinute(start, hasReduceOne)
      const endMin = timeToMinute(end)
      minutes = minutes.concat(getMinutes(startMin, endMin))
    }

    return minutes
  },

  /**
   * 查找时间戳在交易时间中对应的 index
   */
  getTimeIndexByMinute: (timestamp: number, tradeMinutes: number[], isFive: boolean = false): number => {
    const date = new Date(timestamp)
    const time = dayjs(date)
    if (time.isSame(time.startOf('day')) || isFive) {
      // 如果是某一天的起始时间
      return tradeMinutes.indexOf(timestamp)
    }

    const totalMin = date.getHours() * 60 + date.getMinutes()
    return tradeMinutes.indexOf(totalMin) // -1 表示不在交易时间段中
  },

  /**
   * 计算涨跌幅和颜色
   */
  onCalculateRiseAndFall: (price: number, closingPrice: number) => {
    const rf = ((price - closingPrice) / closingPrice) * 100
    const amplitude = `${rf > 0 ? '+' : ''}${rf.toFixed(2)}%`
    return { riseAndFall: rf, amplitude }
  },

  /**
   * 获取 Y 轴标签
   */
  onCalculateYLabels: (
    lines: number = 0,
    props: IAxisProps,
    maxPrice: number = 0,
    minPrice: number = 0,
    basicData: number = 0,
    closingPrice: number = 0
  ): { [K: string]: any } => {
    let newMaxPrice = maxPrice
    let newMinPrice = minPrice

    // 不显示 y 轴
    if (lines === 0) return { yLabels: [], newMaxPrice, newMinPrice }

    const yLabels = props.yLabels || []
    if (yLabels.length > 0) {
      const labels = yLabels
        .map((label: string | number) =>
          typeof label === 'string' ? parseFloat(Number(label).toFixed(2)) : parseFloat(label.toFixed(2))
        )
        .filter(n => !isNaN(Number(n)))

      return labels
    }

    let labels: Array<number> = []

    // 判断有没有基线, 以基线为准
    basicData = basicData ?? 0

    if (basicData > 0) {
      // 1. 如果大于 maxPrice, 则取 maxPrice
      if (basicData > maxPrice) {
        newMaxPrice = basicData + (basicData - minPrice)
      }

      // 2. 如果小于 minPrice, 则取 minPrice
      if (basicData < minPrice) {
        newMinPrice = basicData - (minPrice - basicData)
        if (newMinPrice < 0) {
          newMinPrice = 0
        }
      }
    }

    // 等分
    labels.push(parseFloat(newMinPrice.toFixed(2))) // 最小价格线
    const newLines = lines - 2 // 减去最小价格线和最大价格线
    if (newLines <= 0) {
      if (minPrice !== newMaxPrice) {
        labels.push(parseFloat(newMaxPrice.toFixed(2))) // 最大价格线
      }
      return labels
    }

    const equalRange = parseFloat(((newMaxPrice - newMinPrice) / (newLines + 1)).toFixed(2))
    for (let i = 1; i <= newLines; i++) {
      labels.push(parseFloat((newMinPrice + equalRange * i).toFixed(2)))
    }

    labels.push(parseFloat(newMaxPrice.toFixed(2))) // 最大价格线

    // 根据 yLabels 计算另一侧的涨跌幅
    let amplitudeList: Array<string> = []
    if (closingPrice > 0) {
      for (const label of labels) {
        const { amplitude } = Utils.onCalculateRiseAndFall(label, closingPrice)
        amplitudeList.push(amplitude)
      }
    }

    return { yLabels: labels, newMaxPrice, newMinPrice, yAmplitudes: amplitudeList }
  },

  /**
   * 计算 X 轴坐标
   */
  onCalculateXPoints: (
    width: number = 0,
    height: number = 0,
    isYLeft: boolean,
    fontSize: number = 0,
    xLabels: Array<string | number> = []
  ) => {
    let points: Array<{ [K: string]: any }> = []

    let lines = xLabels.length
    const xStep = Number((width / (lines - 1)).toFixed(2))
    const offsetY = AxisDefaultProps.lineWidthOrHeight

    for (let i = 0; i < lines; i++) {
      let x = i * xStep + XOffset // 第一个偏移, 防止交叉处出现 `伸出来`, 最后一个向左偏移
      let needLine = true
      if (isYLeft && i === 0) {
        needLine = false
      } else if (!isYLeft && i === lines - 1) {
        needLine = false
      }

      let xText = i * xStep
      let textAnchor = 'middle' // 文字默认居中
      if (i === 0) {
        textAnchor = 'start'
        xText += AxisTextOffset // 第一个文字向右偏移
      } else if (i === lines - 1) {
        textAnchor = 'end'
        xText -= AxisTextOffset // // 最后一个文字向左偏移
      }

      points.push({
        line: {
          x1: x,
          y1: height,
          x2: x,
          y2: height + offsetY
        },
        text: {
          x: xText,
          y: height + fontSize + offsetY,
          anchor: textAnchor
        },
        needLine,
        label: xLabels[i] || ''
      })
    }

    return points || []
  },

  /**
   * 计算文字长度
   */
  onMeasureTextSize: (text: string = '', fontSize: number, fontFamily: string) => {
    if (Utils.isBlank(text || '')) {
      return { width: 0, height: 0 }
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return { width: 0, height: 0 }

    context.font = `${fontSize}px ${fontFamily}`
    const metrics = context.measureText(text)
    // 计算高度：fallback 方式，优先用 fontBoundingBoxAscent + Descent
    const height =
      metrics.fontBoundingBoxAscent && metrics.fontBoundingBoxDescent
        ? metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        : fontSize // fallback: 使用 fontSize 近似
    return {
      width: metrics.width,
      height
    }
  },

  /**
   * 计算 Y 轴坐标
   */
  onCalculateYPoints: (
    width: number = 0,
    height: number = 0,
    isYLeft: boolean = false,
    fontSize: number = 0,
    fontFamily: string,
    yLabels: Array<number> = [],
    maxPrice: number,
    highest: IShareHighestProps,
    basic: { [K: string]: any },
    needHighest: boolean = true
  ) => {
    let points: Array<{ [K: string]: any }> = []

    const yStep = height / (yLabels.length - 1)
    const offsetX = AxisDefaultProps.lineWidthOrHeight

    const textAnchor = isYLeft ? 'end' : 'start'
    const x = isYLeft ? 0 : width - AxisDefaultProps.lineWidthOrHeight

    let hasHighest = false
    let hasBasic = false

    const data = basic?.data

    for (let i = 0; i < yLabels.length; i++) {
      const label = yLabels[i]
      const y = Utils.getYPositionPoint(label, yLabels, height)
      const { width } = Utils.onMeasureTextSize(`${label.toFixed(2)}`, fontSize, fontFamily)
      const textOffsetX = isYLeft ? width + AxisTextOffset : -width - AxisTextOffset / 2

      // 判断是不是最高线
      let isHighest = false
      let isBasic = false

      // 最高线
      if (label === maxPrice) {
        if (needHighest) {
          isHighest = true
          hasHighest = true
        }
      }

      // 基线
      if (data !== null && data !== undefined) {
        if (label === data) {
          isBasic = true
          hasBasic = true
        }
      }

      let yText = height - i * yStep + AxisTextOffset
      if (i === 0) {
        yText -= AxisTextOffset * 2 // 第一个文字向上偏移
      } else if (i === yLabels.length - 1) {
        // yText -= AxisTextOffset // // 最后一个文字向下偏移
      }

      points.push({
        line: {
          x1: x,
          y1: y,
          x2: x + offsetX,
          y2: y
        },
        text: {
          x: x + textOffsetX,
          y: yText + fontSize / 2 - 2,
          anchor: textAnchor
        },
        needLine: i !== 0,
        label: `${label.toFixed(2)}`,
        highest: {
          isHighest,
          ...highest
        },
        basic: {
          isBasic,
          ...basic
        }
      })
    }

    return { yPoints: points || [], hasHighest, hasBasic }
  },

  /**
   * 计算线条位置
   */
  getYPositionPoint: (value: number, yLabels: Array<number>, height: number) => {
    if (yLabels.length === 0) return null
    let min = yLabels[0]
    let max = yLabels[yLabels.length - 1]
    if (value < min || value > max) return null

    const percent = (max - value) / (max - min)
    return Number((percent * height).toFixed(2))
  },

  /**
   * 根据坐标点计算价格
   */
  getPriceByYPosition: (y: number, yLabels: Array<number>, height: number): number | null => {
    if (yLabels.length === 0 || height <= 0) return null

    const min = yLabels[0]
    const max = yLabels[yLabels.length - 1]

    if (y < 0 || y > height) return null

    const percent = y / height
    const price = max - percent * (max - min)

    return Number(price.toFixed(2))
  }
}

export default Utils
