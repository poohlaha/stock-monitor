/**
 * @fileOverview 分时图
 * @date 2025-04-24
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { AxisDefaultProps, TimeKDefaultProps } from '../../types/default'
import { ITimeProps, TRADE_TIMES } from '../../types/time'
import Tooltip from '../../components/tooltip'
import Utils from '../../utils'
import { IShareTooltipProps, IShareCrossProps, ITimeDataItemProps } from '../../types/share'
import { Handler, HandleCommon } from '../../utils/handler'

const TimeLine: React.FC<ITimeProps> = (props: ITimeProps): ReactElement => {
  const [tooltipProps, setTooltipProps] = useState({ show: false, x: 0, y: 0, data: [] })
  const [crossProps, setCrossProps] = useState({
    show: false,
    x: 0,
    y: 0,
    index: 0,
    yLeftLabel: '',
    yRightLabel: '',
    xBottomLabel: ''
  })
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null) // 圆点

  /**
   * 获取交易时间
   */
  const getTradeMinutes = () => {
    let tradTimes = props.tradeTimes || []
    const isFive = props.isFive
    if (isFive) {
      if (tradTimes.length === 0) {
        const data = props.data || []
        if (data.length > 0) {
          return data.map((d: ITimeDataItemProps) => d.timestamp ?? 0)
        }
      }
    } else if (tradTimes.length === 0) {
      tradTimes = TRADE_TIMES || []
    }

    // 总时间
    return Utils.getTradingMinutes(tradTimes) || []
  }

  /**
   * 获取价格最小值和最大值
   */
  const getPriceRange = () => {
    const data = props.data || []
    let minPrice = 0
    let maxPrice = 0
    let prices: number[] = []
    let volumes: number[] = []

    if (data.length > 0) {
      prices = data.map((d: ITimeDataItemProps) => d.price ?? 0)
      volumes = data.map((d: ITimeDataItemProps) => d.volume ?? 0)
      minPrice = Math.min(...prices)
      maxPrice = Math.max(...prices)
    }

    return { prices, minPrice, maxPrice, volumes, data }
  }

  /**
   * 折线图
   */
  const getLine = (
    height: number,
    tradeMinutes: Array<number> = [],
    yLabels: Array<number> = [],
    riseColor: string = '',
    fallColor: string = '',
    prefixClassName: string = ''
  ) => {
    const data = props.data || []
    if (data.length === 0) return null

    const width = props.width
    const closingPrice = props.closingPrice ?? 0

    let lineColor = TimeKDefaultProps.defaultColor
    if (closingPrice === 0) {
      const points = data
        .map((d, _) => {
          const price = d.price ?? 0
          const index = Utils.getTimeIndexByMinute(d.timestamp ?? 0, tradeMinutes, props.isFive ?? false)
          if (index === -1) return null

          const x = (index / tradeMinutes.length) * width
          const y = Utils.getYPositionPoint(price, yLabels, height) ?? 0

          return `${x},${y}`
        })
        .filter(Boolean)
        .join(' ')

      return (
        <svg width={props.width} height={height} className={`${prefixClassName || ''}-lines`}>
          <polyline fill="none" stroke={lineColor} strokeWidth={1} points={points} />
        </svg>
      )
    }

    let lines: Array<React.ReactNode> = []
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1]
      const cur = data[i]

      const prevIndex = Utils.getTimeIndexByMinute(prev.timestamp ?? 0, tradeMinutes, props.isFive ?? false)
      const currIndex = Utils.getTimeIndexByMinute(cur.timestamp ?? 0, tradeMinutes, props.isFive ?? false)

      if (prevIndex === -1 || currIndex === -1) continue

      const x1 = (prevIndex / tradeMinutes.length) * width
      const x2 = (currIndex / tradeMinutes.length) * width
      const y1 = Utils.getYPositionPoint(prev.price ?? 0, yLabels, height) ?? 0
      const y2 = Utils.getYPositionPoint(cur.price ?? 0, yLabels, height) ?? 0

      // 计算颜色
      let lineColor = TimeKDefaultProps.defaultColor
      if (closingPrice > 0) {
        lineColor = (cur.price ?? 0) > closingPrice ? riseColor || '' : fallColor || ''
      }

      lines.push(<line key={i} x1={x1 || 0} y1={y1 || 0} x2={x2 || 0} y2={y2 || 0} stroke={lineColor} strokeWidth={1} />)
    }

    return (
      <svg width={props.width || 0} height={height || 0} className={`${prefixClassName || ''}-lines`}>
        {lines}
      </svg>
    )
  }

  /**
   * 获取 tooltip 数据
   */
  const getTooltipData = (
    data: ITimeDataItemProps,
    riseColor: string = '',
    fallColor: string = '',
    flatColor: string
  ) => {
    let tooltipData: any = []
    const closingPrice = props.closingPrice ?? 0

    const price = data.price ?? 0

    tooltipData.push({
      label: '时间',
      value: Utils.formatTimestamp(data.timestamp)
    })

    tooltipData.push({
      label: '价格',
      value: Utils.formatNumberUnit(parseFloat(price.toFixed(4)))
    })

    // 计算涨跌额| 涨跌幅
    if (closingPrice > 0) {
      const obj = Handler.onCalculateRiseFall(data.riseFall, data.amplitude, riseColor, fallColor, flatColor) || {}
      const curPrice = price - closingPrice
      const { riseAndFall, amplitude } = Utils.onCalculateRiseAndFall(price, closingPrice)
      let riseFall = obj.riseFall
      let amp = obj.amplitude
      let rfColor = obj.rfColor || ''
      let ampColor = obj.ampColor || ''
      if (riseFall === undefined) {
        riseFall = `${curPrice > 0 ? '+' : ''}${curPrice.toFixed(2)}`
        rfColor = curPrice > 0 ? riseColor : price === 0 ? flatColor : fallColor
      }

      if (amp === undefined) {
        amp = amplitude || ''
        ampColor = riseAndFall > 0 ? riseColor : price === 0 ? flatColor : fallColor
      }

      tooltipData.push({
        label: '涨跌额',
        value: riseFall,
        color: rfColor
      })

      tooltipData.push({
        label: '涨跌幅',
        value: amp,
        color: ampColor
      })
    }

    tooltipData.push({
      label: '成交量',
      value: Utils.formatNumberUnit(parseFloat((data.volume ?? 0).toFixed(2)))
    })

    tooltipData.push({
      label: '成交额',
      value: Utils.formatNumberUnit(parseFloat((data.turnover ?? 0).toFixed(2)))
    })

    return tooltipData
  }

  const onMouseMove = (
    e: React.MouseEvent<SVGSVGElement>,
    tradeMinutes: Array<number>,
    cross: IShareCrossProps,
    toolTip: IShareTooltipProps,
    yLabels: Array<number>,
    height: number,
    riseColor: string = '',
    fallColor: string = '',
    flatColor: string = ''
  ) => {
    const timeData = props.data || []
    if (timeData.length === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    let mouseY = e.clientY - rect.top

    if (mouseX < 0) {
      return
    }

    // 如果在 X 轴 坐标下面, 则不显示
    const totalMinutes = tradeMinutes.length

    // 鼠标占总宽度的百分比
    const percent = mouseX / props.width
    let minuteIndex = Math.floor(percent * totalMinutes)

    // 限制最大 index 到最后数据点的时间 index
    const lastDataMinute = Utils.getTimeIndexByMinute(
      timeData[timeData.length - 1].timestamp,
      tradeMinutes,
      props.isFive ?? false
    )
    minuteIndex = Math.min(minuteIndex, lastDataMinute)

    // 根据 minuteIndex 反算 mouseX, 保证 cross 不超出最后时间位置, 需要在超出最大时间后 `钉死` 在最大时间点
    const unitX = props.width / totalMinutes
    const fixedMouseX = minuteIndex * unitX

    // 反推数据 index（建立 “分钟索引 -> 数据索引” 映射）
    const dataIndex = timeData.findIndex(
      d => Utils.getTimeIndexByMinute(d.timestamp ?? 0, tradeMinutes, props.isFive ?? false) === minuteIndex
    )
    if (dataIndex === -1) return

    const clampedIndex = Math.max(0, Math.min(dataIndex, timeData.length - 1))

    const data = timeData[clampedIndex]
    if (!data) return

    // 计算圆点位置
    const positionY = Utils.getYPositionPoint(data.price, yLabels, height) ?? 0
    setFocusPoint({ x: mouseX > fixedMouseX ? fixedMouseX : mouseX, y: positionY })

    if (cross.show) {
      const yPoint = Utils.getPriceByYPosition(mouseY, yLabels, height)
      const yLeftLabel = yPoint === null ? '' : `${yPoint.toFixed(2)}`
      setCrossProps({
        show: true,
        x: fixedMouseX,
        y: mouseY,
        index: clampedIndex,
        yLeftLabel,
        yRightLabel: yLeftLabel,
        xBottomLabel: Utils.formatTimestamp(data.timestamp)
      })
    }

    const tooltipData = getTooltipData(data, riseColor, fallColor, flatColor)
    if (toolTip.show) {
      setTooltipProps({
        show: true,
        data: tooltipData,
        x: e.clientX + 10,
        y: e.clientY + 10
      })
    }
  }

  const onMouseLeave = () => {
    setCrossProps({ show: false, x: 0, y: 0, index: 0, yLeftLabel: '', yRightLabel: '', xBottomLabel: '' })
    setTooltipProps({ show: false, x: 0, y: 0, data: [] })
    setFocusPoint(null)
  }

  /**
   * 计算 X 轴, Y 轴坐标点
   */
  const onCalculateXYPoints = () => {
    const { maxPrice, minPrice, prices, volumes, data } = getPriceRange()

    const tradeMinutes = getTradeMinutes() // 总时长

    let xLabels = (props.axis || {}).xLabels ?? AxisDefaultProps.xLabels
    if (xLabels.length === 0) {
      xLabels = AxisDefaultProps.xLabels
    }

    const commonProps = Handler.getKTimeProps(props, xLabels, props.closingPrice ?? 0, maxPrice, minPrice)
    return {
      maxPrice,
      minPrice,
      tradeMinutes,
      prices,
      volumes,
      data,
      ...commonProps,
      cross: {
        ...(commonProps.cross || {}),
        yAmplitudes: commonProps.yAmplitudes || []
      }
    }
  }

  const getTooltip = (tooltip: IShareTooltipProps, prefixClassName: string = '') => {
    if (!tooltip.show) return null

    return (
      <Tooltip
        {...tooltip}
        x={tooltipProps.x ?? 0}
        y={tooltipProps.y ?? 0}
        data={tooltipProps.data || []}
        show={tooltipProps.show}
        prefixClassName={prefixClassName || ''}
      />
    )
  }

  const render = () => {
    const {
      prefixClassName,
      yAmplitudes,
      xPoints,
      yPoints,
      width,
      height,
      grid,
      axis,
      highest,
      hasHighest,
      basic,
      hasBasic,
      tradeMinutes,
      yLabels,
      cross,
      tooltip,
      volume,
      data,
      fontSize,
      fontFamily,
      riseColor,
      fallColor,
      flatColor
    } = onCalculateXYPoints()
    return (
      <div
        className={`${prefixClassName || ''}-time-chart items-center justify-center wh100 relative ${props.className || ''}`}
        style={{
          width: props.width,
          height: props.height
        }}
      >
        <svg
          width={props.width}
          height={props.height}
          onMouseMove={e =>
            onMouseMove(e, tradeMinutes, cross, tooltip, yLabels, height, riseColor, fallColor, flatColor)
          }
          onMouseLeave={onMouseLeave}
        >
          {/* 折线图 */}
          {getLine(height, tradeMinutes, yLabels, riseColor, fallColor, prefixClassName || '')}

          {/* 背景网格 | 坐标轴 ｜ 最高线 | 基线 | 十字准线 | 成交量柱状图 */}
          {HandleCommon.getCommon(
            props,
            prefixClassName,
            width,
            height,
            grid,
            axis,
            highest,
            basic,
            cross,
            volume,
            data,
            xPoints,
            yPoints,
            yAmplitudes,
            tradeMinutes,
            crossProps,
            fontSize,
            fontFamily,
            hasHighest,
            hasBasic
          )}

          {/* 折线图圆点 */}
          {focusPoint && (
            <circle
              className={`${prefixClassName || ''}-circle`}
              cx={focusPoint.x}
              cy={focusPoint.y || 0}
              r={2} // 圆点半径
              fill={cross.color} // 高亮颜色
              strokeWidth={1}
            />
          )}
        </svg>

        {/* ToolTip */}
        {getTooltip(tooltip, prefixClassName || '')}
      </div>
    )
  }

  return render()
}

export default TimeLine
