/**
 * @fileOverview 分时图和 K 线图公共方法
 * @date 2025-05-07
 * @author poohlaha
 */
import {
  IShareAxisProps,
  IShareCrossProps,
  IShareGridProps,
  IShareHighestProps,
  ITimeKProps,
  IShareTooltipProps,
  IVolumeProps,
  IVolumeDataItemProps,
  IHighestProps
} from '../types/share'
import { LineType } from '../types/default'
import {
  AxisDefaultProps,
  AxisTextOffset,
  DefaultCrossProps,
  GridDefaultProps,
  HighestDefaultProps,
  TimeKDefaultProps,
  TooltipDefaultDataProps,
  VolumeDefaultProps
} from '../types/default'
import Utils from './index'
import React from 'react'
import Grid from '../components/grid'
import Axis from '../components/axis'
import Highest from '../components/highest'
import Cross from '../components/cross'
import Volume from '../components/volume'

const Handler = {
  /**
   * 获取样式前缀
   */
  getPrefixClassName: (prefixClassName: string = '') => {
    if (Utils.isBlank(prefixClassName || '')) {
      return TimeKDefaultProps.prefixClassName
    }

    return prefixClassName || ''
  },

  /**
   * 获取网格属性
   */
  getGridProps: (props: ITimeKProps) => {
    const grid = props.grid || {}
    const verticalLines = GridDefaultProps.verticalLines // 垂直条数(X轴)
    const horizontalLines = GridDefaultProps.horizontalLines // 水平线条数(Y轴)

    if (grid.show === false) {
      return {
        verticalLines,
        horizontalLines,
        show: false
      } as IShareGridProps
    }

    return {
      ...grid,
      show: true,
      verticalLines,
      horizontalLines
    } as IShareGridProps
  },

  /**
   * 获取坐标属性
   */
  getAxisProps: (
    props: ITimeKProps,
    xLabels: Array<string>,
    fontSize: number,
    fontFamily: string,
    width: number,
    height: number,
    axisPadding: number,
    totalWidth: number,
    totalHeight: number
  ) => {
    const axis = props.axis || {}
    const yPosition = axis.yPosition ?? AxisDefaultProps.yPosition
    const isYLeft = yPosition === 'left'
    const lineColor = axis.lineColor ?? AxisDefaultProps.lineColor
    const textColor = axis.textColor ?? AxisDefaultProps.textColor
    const needXLabelLine = axis.needXLabelLine ?? AxisDefaultProps.needXLabelLine
    const needYLabelLine = axis.needYLabelLine ?? AxisDefaultProps.needYLabelLine
    const needAxisXLine = axis.needAxisXLine ?? AxisDefaultProps.needAxisXLine
    const needAxisYLine = axis.needAxisYLine ?? AxisDefaultProps.needAxisYLine
    return {
      ...axis,
      padding: axisPadding,
      fontSize,
      fontFamily,
      lineColor,
      textColor,
      axisPadding,
      yPosition,
      isYLeft,
      xLabels,
      needXLabelLine,
      needYLabelLine,
      needAxisXLine,
      needAxisYLine,
      width,
      height,
      totalWidth,
      totalHeight,
      xPoints: [],
      yPoints: [],
      yAmplitudes: [],
      prefixClassName: ''
    } as IShareAxisProps
  },

  /**
   * 获取十字准线属性
   */
  getCrossProps: (
    props: ITimeKProps,
    width: number,
    height: number,
    volume: IVolumeProps,
    fontSize: number,
    fontFamily: string,
    isAxisLeft: boolean,
    closingPrice: number = 0
  ) => {
    const crossProps: { [K: string]: any } = props.cross || {}
    const show = crossProps.show ?? true
    if (!show) {
      return {
        show: false
      } as IShareCrossProps
    }

    const color = Utils.isBlank(crossProps.color || '') ? DefaultCrossProps.color : crossProps.color || ''
    const textColor = Utils.isBlank(crossProps.textColor || '')
      ? DefaultCrossProps.textColor
      : crossProps.textColor || ''
    const textBackgroundColor = Utils.isBlank(crossProps.textBackgroundColor || '')
      ? DefaultCrossProps.textBackgroundColor
      : crossProps.textBackgroundColor || ''
    const lineType = crossProps.lineType ?? (DefaultCrossProps.lineType as LineType)
    return {
      show: true,
      color,
      textColor,
      lineType,
      width,
      height: volume.show ? props.height : height,
      fontSize,
      fontFamily,
      textBackgroundColor,
      isAxisLeft,
      closingPrice
    } as IShareCrossProps
  },

  /**
   * 是否显示基准线
   */
  getBasicShow: (props: ITimeKProps) => {
    const basic = props.basic
    if (basic === undefined) {
      return false
    }

    return basic.show
  },

  /**
   * 获取最高线属性
   */
  getHighestProps: (
    highest: IHighestProps | undefined,
    width: number,
    height: number,
    price: number,
    fontSize: number,
    fontFamily: string,
    isYLeft: boolean,
    yLabels: Array<number>,
    closingPrice: number
  ) => {
    if (highest === undefined) {
      return {
        show: false
      } as IShareHighestProps
    }

    const show = highest.show
    if (show === false) {
      return {
        show: false
      } as IShareHighestProps
    }

    const lineColor = highest.lineColor ?? HighestDefaultProps.lineColor
    const textColor = highest.textColor ?? HighestDefaultProps.textColor
    const lineType = highest.lineType ?? HighestDefaultProps.lineType
    const y = Utils.getYPositionPoint(price, yLabels, height)

    return {
      show: true,
      lineColor,
      textColor,
      lineType,
      width,
      height,
      price,
      fontSize,
      fontFamily,
      y,
      isAxisLeft: isYLeft,
      closingPrice
    } as IShareHighestProps
  },

  /**
   * 获取 基线 属性
   */
  getBasicProps: (
    prefixClassName: string = '',
    props: ITimeKProps,
    width: number,
    height: number,
    fontSize: number,
    fontFamily: string,
    isYLeft: boolean,
    yLabels: Array<number>,
    closingPrice: number,
    needAnotherSide: boolean = true
  ) => {
    const basic = props.basic
    if (basic === undefined) {
      return {
        show: false
      } as IShareHighestProps
    }

    const show = basic.show ?? true
    if (!show) {
      return {
        show: false
      } as IShareHighestProps
    }

    const lineColor = basic.lineColor ?? HighestDefaultProps.lineColor
    const textColor = basic.textColor ?? HighestDefaultProps.textColor
    const lineType = basic.lineType ?? HighestDefaultProps.lineType
    const y = Utils.getYPositionPoint(basic.data, yLabels, height)

    return {
      ...basic,
      lineColor,
      textColor,
      lineType,
      width,
      height,
      price: basic.data,
      fontSize,
      fontFamily,
      y,
      isAxisLeft: isYLeft,
      closingPrice,
      className: `${prefixClassName || ''}-basic`,
      hasHighest: false,
      prefixClassName,
      needAnotherSide: needAnotherSide ?? true
    } as IShareHighestProps
  },

  /**
   * 获取成交量柱状图属性
   */
  getVolumeProps: (props: ITimeKProps, riseColor: string = '', fallColor: string = '') => {
    const volume = props.volume || {}
    if (volume.show === false) {
      return {
        show: false
      }
    }

    const height = volume.height ?? VolumeDefaultProps.height
    return {
      show: true,
      riseColor,
      fallColor,
      height
    }
  },

  /**
   * Tooltip 属性
   */
  getTooltipProp: (props: ITimeKProps) => {
    const tooltip = props.tooltip || {}
    const show = tooltip.show
    if (show === false) {
      return {
        show: false
      } as IShareTooltipProps
    }

    const width = tooltip.width ?? TooltipDefaultDataProps.width
    const height = tooltip.height
    const className = Utils.isBlank(tooltip.className || '')
      ? TooltipDefaultDataProps.className
      : tooltip.className || ''
    const fontClassName = Utils.isBlank(tooltip.fontClassName || '')
      ? TooltipDefaultDataProps.fontClassName
      : tooltip.fontClassName || ''
    return {
      show: true,
      width,
      height,
      className,
      fontClassName
    } as IShareTooltipProps
  },

  /**
   * 获取分时图默认属性
   */
  getKTimeProps: (
    props: ITimeKProps,
    xLabels: Array<string> = [],
    closingPrice: number = 0,
    maxPrice: number = 0,
    minPrice: number = 0,
    needHighest: boolean = true,
    needAnotherSide: boolean = true
  ) => {
    // 获取样式前缀
    const prefixClassName = Handler.getPrefixClassName(props.prefixClassName || '')

    // 字体大小
    let fontSize = props.fontSize ?? 0
    if (fontSize === 0) {
      fontSize = TimeKDefaultProps.fontSize
    }

    // 字体名称
    const fontFamily = Utils.isBlank(props.fontFamily || '') ? TimeKDefaultProps.fontFamily : props.fontFamily || ''

    // 涨颜色
    const riseColor = Utils.isBlank(props.riseColor || '') ? TimeKDefaultProps.riseColor : props.riseColor || ''

    // 跌颜色
    const fallColor = Utils.isBlank(props.fallColor || '') ? TimeKDefaultProps.fallColor : props.fallColor || ''

    // 持平价格
    const flatColor = Utils.isBlank(props.flatColor || '') ? TimeKDefaultProps.flatColor : props.flatColor || ''

    const basicShow = Handler.getBasicShow(props)

    // axis label height
    const axisPadding =
      (props.axis || {}).padding === null || (props.axis || {}).padding === undefined
        ? AxisDefaultProps.padding
        : ((props.axis || {}).padding ?? 0)

    // 成交量柱状图
    const volume = Handler.getVolumeProps(props, riseColor, fallColor)

    // width
    const width = props.width

    // height
    let height = props.height - axisPadding - (volume.show ? volume.height || 0 : 0)
    if (height < 0) {
      height = 0
    }

    // 网格背景
    const grid = Handler.getGridProps(props)

    // 坐标轴
    const axis = Handler.getAxisProps(
      props,
      xLabels,
      fontSize,
      fontFamily,
      width,
      height,
      axisPadding,
      props.width,
      props.height
    )

    // 十字准线
    const cross = Handler.getCrossProps(
      props,
      width,
      height,
      volume,
      fontSize,
      fontFamily,
      axis.isYLeft,
      closingPrice ?? 0
    )

    const { yLabels, newMaxPrice, newMinPrice, yAmplitudes } =
      Utils.onCalculateYLabels(
        grid.horizontalLines,
        axis,
        maxPrice,
        minPrice,
        basicShow ? props.basic?.data : 0,
        closingPrice ?? 0
      ) || []

    // 最高线
    const highest = Handler.getHighestProps(
      props.highest,
      width,
      height,
      maxPrice,
      fontSize,
      fontFamily,
      axis.isYLeft,
      yLabels,
      closingPrice ?? 0
    )

    // 基线
    const basic = Handler.getBasicProps(
      prefixClassName,
      props,
      width,
      height,
      fontSize,
      fontFamily,
      axis.isYLeft,
      yLabels,
      closingPrice ?? 0,
      needAnotherSide
    )

    // tooltip
    const tooltip = Handler.getTooltipProp(props)

    const xPoints: Array<{ [K: string]: any }> = Utils.onCalculateXPoints(
      width,
      height,
      axis.isYLeft,
      fontSize,
      axis.xLabels
    )

    const { yPoints, hasHighest, hasBasic } = Utils.onCalculateYPoints(
      width,
      height,
      axis.isYLeft,
      fontSize,
      fontFamily,
      yLabels,
      maxPrice,
      highest,
      basic,
      needHighest
    )

    return {
      prefixClassName,
      fontSize,
      fontFamily,
      riseColor,
      fallColor,
      flatColor,
      axisPadding,
      volume,
      width,
      height,
      grid,
      axis,
      cross,
      highest,
      basic,
      tooltip,
      xLabels,
      yLabels,
      basicShow,
      newMaxPrice,
      newMinPrice,
      yAmplitudes,
      xPoints,
      yPoints,
      hasHighest,
      hasBasic
    }
  },

  /**
   * 计算成交量和蜡烛图中的宽度和坐标
   */
  getBarWidthAndX: (index: number, unitWidth: number, widthRatio = 0) => {
    let ratio = widthRatio
    if (ratio === 0) {
      ratio = TimeKDefaultProps.barWidthScale
    }

    const barWidth = unitWidth * ratio
    if (index === -1) {
      return { x: 0, barWidth }
    }

    const x = index * unitWidth + (unitWidth - barWidth) / 2
    return { x, barWidth }
  },

  /**
   * 计算涨跌幅
   */
  onCalculateRiseFall: (
    riseFall: string | number | undefined,
    amplitude: string | number | undefined,
    riseColor: string = '',
    fallColor: string = '',
    flatColor: string = ''
  ) => {
    let obj = {
      riseFall,
      amplitude,
      rfColor: flatColor || '',
      ampColor: flatColor || ''
    }

    const getRiseFall = (num: number, spec: string = '') => {
      let color = flatColor || ''
      let value = ''
      if (num > 0) {
        value = `+${num.toFixed(2)}${spec || ''}`
        color = riseColor || ''
      } else if (num < 0) {
        value = `${num.toFixed(2)}${spec || ''}`
        color = fallColor || ''
      }

      return { value, color }
    }

    // 涨跌额
    if (obj.riseFall !== undefined) {
      let objRf = obj.riseFall
      if (typeof objRf === 'string') {
        objRf = Number(objRf)
      }

      const { value, color } = getRiseFall(objRf)
      obj.riseFall = value || ''
      obj.rfColor = color || ''
    }

    // 涨跌幅
    if (obj.amplitude !== undefined) {
      let objAmp = obj.amplitude
      if (typeof objAmp === 'string') {
        objAmp = objAmp.replace('%', '')
        objAmp = Number(objAmp)
      }

      const { value, color } = getRiseFall(objAmp, '%')
      obj.amplitude = value || ''
      obj.ampColor = color || ''
    }

    return obj
  }
}

const HandleCommon = {
  /**
   * 背景网格
   */
  getGrid: (
    width: number,
    height: number,
    grid: IShareGridProps,
    xPoints: Array<{ [K: string]: any }> = [],
    yPoints: Array<{ [K: string]: any }> = [],
    isYLeft: boolean,
    prefixClassName: string = ''
  ) => {
    if (grid.show === false) {
      return null
    }

    return (
      <Grid
        {...grid}
        width={width}
        height={height}
        xPoints={xPoints}
        yPoints={yPoints}
        isYLeft={isYLeft}
        prefixClassName={prefixClassName || ''}
      />
    )
  },

  /**
   * x 轴和 y 轴
   */
  getAxis: (
    axis: IShareAxisProps,
    xPoints: Array<{ [K: string]: any }> = [],
    yPoints: Array<{ [K: string]: any }> = [],
    yAmplitudes: Array<string> = [],
    prefixClassName: string = ''
  ) => {
    return (
      <Axis
        {...axis}
        xPoints={xPoints}
        yPoints={yPoints}
        yAmplitudes={yAmplitudes}
        prefixClassName={prefixClassName || ''}
      />
    )
  },

  /**
   * 最高线
   */
  getHighest: (
    highest: IShareHighestProps,
    hasHighest: boolean,
    grid: IShareGridProps,
    prefixClassName: string = ''
  ) => {
    if (hasHighest) {
      // 如果背景显示, 则不画线
      if (grid.show) {
        return null
      }
    }

    const show = highest.show ?? true
    if (!show) return null

    return <Highest {...highest} hasHighest={hasHighest} prefixClassName={prefixClassName || ''} />
  },

  /**
   * 基线
   */
  getBasic: (basic: IShareHighestProps, hasBasic: boolean, grid: IShareGridProps, prefixClassName: string = '') => {
    if (hasBasic) {
      if (grid.show) {
        return null
      }
    }

    const show = basic.show ?? true
    if (!show) return null

    return <Highest {...basic} hasHighest={hasBasic} prefixClassName={prefixClassName || ''} />
  },

  /**
   * 十字准线
   */
  getCross: (
    cross: IShareCrossProps,
    crossProps: { [K: string]: any } = {},
    prefixClassName: string = '',
    height: number
  ) => {
    if (!cross.show) return null

    return (
      <Cross
        {...cross}
        x={crossProps.x}
        y={crossProps.y}
        show={crossProps.show}
        yLeftLabel={crossProps.yLeftLabel}
        yRightLabel={crossProps.yRightLabel}
        xBottomLabel={crossProps.xBottomLabel}
        prefixClassName={prefixClassName || ''}
        innerHeight={height}
      />
    )
  },

  /**
   * 成交量柱状图
   */
  getVolumeBars: (
    props: ITimeKProps,
    volumeProps: { [K: string]: any },
    data: Array<IVolumeDataItemProps> = [],
    fontSize: number,
    fontFamily: string,
    tradeMinutes: Array<any> = [],
    prefixClassName: string = ''
  ) => {
    if (!volumeProps.show) return null

    let total = 0
    if (data.length > 0) {
      let item = data[data.length - 1]
      total = item.volume ?? 0
    }

    const maxVolume = Math.max(...data.map(d => d.volume ?? 0))
    const volumeHeight = volumeProps.height ?? VolumeDefaultProps.height
    return (
      <svg width={props.width} height={props.height} className={`${prefixClassName || ''}-volume`}>
        <text
          x={AxisTextOffset}
          y={props.height - volumeHeight + AxisTextOffset}
          fill={volumeProps.textColor}
          textAnchor="start"
          fontSize={fontSize}
          fontFamily={fontFamily}
        >
          成交量{Utils.formatNumberUnit(total)}手
        </text>

        {data.length > 0 &&
          data.map((item, index: number) => {
            const prevPrice = index > 0 ? data[index - 1].price : item.price
            const color = item.price >= prevPrice ? volumeProps.riseColor || '' : volumeProps.fallColor || ''
            const unitWidth = props.width / tradeMinutes.length
            const { x, barWidth } = Handler.getBarWidthAndX(index, unitWidth, TimeKDefaultProps.barWidthScale)
            const barHeight = (Math.abs(item.volume) / maxVolume) * volumeHeight

            return (
              <Volume
                key={index}
                x={x}
                y={props.height - barHeight}
                width={barWidth}
                height={barHeight}
                color={color}
                prefixClassName={prefixClassName}
              />
            )
          })}
      </svg>
    )
  },

  /**
   * 获取公共
   */
  getCommon: (
    props: ITimeKProps,
    prefixClassName: string = '',
    width: number = 0,
    height: number = 0,
    grid: IShareGridProps,
    axis: IShareAxisProps,
    highest: IShareHighestProps,
    basic: IShareHighestProps,
    cross: IShareCrossProps,
    volume: { [K: string]: any },
    volumeData: Array<IVolumeDataItemProps> = [],
    xPoints: Array<{ [K: string]: any }> = [],
    yPoints: Array<{ [K: string]: any }> = [],
    yAmplitudes: Array<string> = [],
    tradeMinutes: Array<any> = [],
    crossProps: { [K: string]: any } = {},
    fontSize: number = 0,
    fontFamily: string = '',
    hasHighest: boolean,
    hasBasic: boolean,
    needHighest: boolean = true
  ) => {
    return (
      <>
        {/* 背景网格 */}
        {HandleCommon.getGrid(width, height, grid, xPoints, yPoints, axis.isYLeft, prefixClassName || '')}

        {/* 坐标轴 */}
        {HandleCommon.getAxis(axis, xPoints, yPoints, yAmplitudes, prefixClassName || '')}

        {/* 最高线 */}
        {needHighest && HandleCommon.getHighest(highest, hasHighest, grid, prefixClassName || '')}

        {/* 基线 */}
        {HandleCommon.getBasic(basic, hasBasic, grid, prefixClassName || '')}

        {/* 十字准线 */}
        {HandleCommon.getCross(cross, crossProps, prefixClassName || '', height)}

        {/* 成交量柱状图 */}
        {HandleCommon.getVolumeBars(
          props,
          volume,
          volumeData,
          fontSize,
          fontFamily,
          tradeMinutes,
          prefixClassName || ''
        )}
      </>
    )
  }
}

export { Handler, HandleCommon }
