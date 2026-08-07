/**
 * @fileOverview 分时图和 K 线图整合
 * @date 2025-05-08
 * @author poohlaha
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { IShareLineKProps, IShareLineProps, IShareLineTimeProps, IShareTabsProps, ITimeKProps } from '../types/share'
import { DefaultShareLineProps, KDefaultProps, TimeKDefaultProps } from '../types/default'
import Utils from '../utils'
import { Handler } from '../utils/handler'
import TimeLine from './time'
import KLine from './k'
import { ITimeProps } from '../types/time'
import { IKProps } from '../types/k'

const ShareLine: React.FC<IShareLineProps> = (props: IShareLineProps): ReactElement => {
  const [tabActiveItem, setTabActiveItem] = useState<{ [K: string]: any }>({ value: '', label: '' })
  const [_, setSize] = useState<{ [K: string]: any }>({ width: 0, height: 0 })
  const [timeKSize, setTimeKSize] = useState<{ [K: string]: any }>({ width: 0, height: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const current = ref.current
    const tabCurrent = tabsRef.current
    if (!current || !tabCurrent) return
    const rect = current.getBoundingClientRect()
    const tabRect = tabCurrent.getBoundingClientRect()
    const height = rect.height - tabRect.height
    setSize({ width: rect.width ?? 0, height: rect.height })
    setTimeKSize({ width: rect.width ?? 0, height: height < 0 ? 0 : height })
  }, [ref, tabsRef, props.width, props.height])

  useEffect(() => {
    const commonProps = getCommonProps()
    const labels = getTabsLabels(commonProps) || []
    if (labels.length === 0) {
      return
    }

    let activeIndex = props.tabs?.activeIndex ?? 0
    let item: { [K: string]: any }

    if (activeIndex > labels.length - 1) {
      item = labels[0] || {}
    } else {
      item = labels[activeIndex] || {}
    }

    setTabActiveItem({ value: item.value || '', label: item.label || '' })
  }, [props.tabs?.activeIndex ?? 0])

  /**
   * 获取 分时图 属性
   */
  const getTimeProps = (time: IShareLineTimeProps | undefined | null, isFive: boolean = false) => {
    if (time === undefined || time === null) {
      return null
    }

    const show = time.show ?? true
    if (!show) {
      return null
    }

    return {
      title: time.title || '',
      ...(time || ''),
      isFive
    } as IShareLineTimeProps
  }

  /**
   * 获取 K 线图 属性
   */
  const getKProps = (kProps: IShareLineKProps | undefined | null) => {
    if (kProps === undefined || kProps === null) {
      return null
    }

    const show = kProps.show ?? true
    if (!show) return null

    return {
      ...(kProps || {})
    } as IShareLineKProps
  }

  /**
   * 获取 tabs 属性
   */
  const getTabsProps = () => {
    const tabs = props.tabs || {}
    const activeIndex = tabs.activeIndex ?? 0
    const className = Utils.isBlank(tabs.className || '') ? DefaultShareLineProps.tab.className : tabs.className || ''
    const activeClassName = Utils.isBlank(tabs.activeClassName || '')
      ? DefaultShareLineProps.tab.activeClassName
      : tabs.activeClassName || ''
    const textColor = Utils.isBlank(tabs.textColor || '') ? DefaultShareLineProps.tab.textColor : tabs.textColor || ''
    const activeTextColor = Utils.isBlank(tabs.activeTextColor || '')
      ? DefaultShareLineProps.tab.activeTextColor
      : tabs.activeTextColor || ''
    const fontClassName = Utils.isBlank(tabs.fontClassName || '')
      ? DefaultShareLineProps.tab.fontClassName
      : tabs.fontClassName || ''
    return {
      activeIndex,
      className,
      activeClassName,
      textColor,
      activeTextColor,
      fontClassName,
      onTabClick: tabs.onTabClick
    } as IShareTabsProps
  }

  /**
   * 获取 tabs 标题
   */
  const getTabsLabels = (commonProps: IShareLineProps = {}) => {
    let labels: Array<{ [K: string]: any }> = []
    if (commonProps.time !== null && commonProps.time !== undefined) {
      const label = Utils.isBlank(commonProps.time.title || '')
        ? TimeKDefaultProps.tabs[0].label || ''
        : commonProps.time.title || ''
      labels.push({
        label,
        value: TimeKDefaultProps.tabs[0].value || ''
      })
    }

    if (commonProps.fiveTime !== null && commonProps.fiveTime !== undefined) {
      const label = Utils.isBlank(commonProps.fiveTime.title || '')
        ? TimeKDefaultProps.tabs[1].label || ''
        : commonProps.fiveTime.title || ''
      labels.push({
        label,
        value: TimeKDefaultProps.tabs[1].value || ''
      })
    }

    if (commonProps.dailyK !== null && commonProps.dailyK !== undefined) {
      const label = Utils.isBlank(commonProps.dailyK.title || '')
        ? TimeKDefaultProps.tabs[2].label || ''
        : commonProps.dailyK.title || ''
      labels.push({
        label,
        value: TimeKDefaultProps.tabs[2].value || ''
      })
    }

    if (commonProps.weekK !== null && commonProps.weekK !== undefined) {
      const label = Utils.isBlank(commonProps.weekK.title || '')
        ? TimeKDefaultProps.tabs[3].label || ''
        : commonProps.weekK.title || ''
      labels.push({
        label,
        value: TimeKDefaultProps.tabs[3].value || ''
      })
    }

    if (commonProps.monthK !== null && commonProps.monthK !== undefined) {
      const label = Utils.isBlank(commonProps.monthK.title || '')
        ? TimeKDefaultProps.tabs[4].label || ''
        : commonProps.monthK.title || ''
      labels.push({
        label,
        value: TimeKDefaultProps.tabs[4].value || ''
      })
    }

    return labels || []
  }

  /**
   * 获取 Tabs
   */
  const getTabNode = (commonProps: IShareLineProps = {}) => {
    // 获取所有标题
    const labels = getTabsLabels(commonProps) || []
    if (labels.length === 0) {
      return null
    }

    const tabs = commonProps.tabs || {}
    return (
      <div className={`${commonProps.prefixClassName || ''}-share-tabs p-2`} ref={tabsRef}>
        <div
          className={`flex items-center rounded-xl ${commonProps.prefixClassName || ''}-share-tab-box pb-1 pt-1 pl-2 pr-2 ${tabs.className || ''} ${tabs.textColor || ''} ${tabs.fontClassName || ''}`}
        >
          {labels.map((item: { [K: string]: any } = {}, index: number) => {
            return (
              <div
                className={`${commonProps.prefixClassName || ''}-share-tabs-item flex-1 flex items-center justify-center cursor-pointer ${tabActiveItem.value === item.value ? `${commonProps.prefixClassName || ''}-share-tab-active ${tabs.activeClassName || ''} ${tabs.activeTextColor || ''}` : ''}`}
                key={item.value}
                onClick={() => {
                  if (tabActiveItem.value === item.value) return
                  setTabActiveItem(item)
                  tabs.onTabClick?.(index, item)
                }}
              >
                {item.label || ''}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /**
   * 获取公共属性
   */
  const getCommonProps = () => {
    const time = getTimeProps(props.time, false)
    const fiveTime = getTimeProps(props.fiveTime, true)
    const dailyK = getKProps(props.dailyK)
    const weekK = getKProps(props.weekK)
    const monthK = getKProps(props.monthK)
    const tabs = getTabsProps()

    const prefixClassName = Handler.getPrefixClassName(props.prefixClassName || '')
    const width = props.width ?? '100%'
    const height = props.height ?? '100%'
    const fontSize = props.fontSize ?? 0
    const fontFamily = Utils.isBlank(props.fontFamily || '') ? TimeKDefaultProps.fontFamily : props.fontFamily || ''
    let zoomStep = props.zoomStep ?? 0
    if (zoomStep === 0) {
      zoomStep = KDefaultProps.zoomStep
    }
    return {
      ...props,
      prefixClassName,
      width,
      height,
      time,
      fiveTime,
      dailyK,
      weekK,
      monthK,
      tabs,
      fontSize,
      fontFamily,
      zoomStep
    } as IShareLineProps
  }

  /**
   * 获取分时图 | K线图公共属性
   */
  const getTimeKProps = (commonProps: IShareLineProps = {}) => {
    const prefixClassName = commonProps.prefixClassName || ''
    const width = timeKSize.width
    const height = timeKSize.height
    const type = commonProps.type ?? 'svg'
    const grid = commonProps.grid
    const axis = commonProps.axis
    const basic = commonProps.basic
    const highest = commonProps.highest
    const cross = commonProps.cross
    const tooltip = commonProps.tooltip
    const volume = commonProps.volume
    const closingPrice = commonProps.closingPrice ?? 0
    const riseColor = commonProps.riseColor || ''
    const fallColor = commonProps.fallColor || ''
    const flatColor = commonProps.flatColor || ''
    const fontSize = commonProps.fontSize ?? TimeKDefaultProps.fontSize
    const fontFamily = commonProps.fontFamily || ''
    const zoomStep = commonProps.zoomStep ?? KDefaultProps.zoomStep

    return {
      prefixClassName,
      type,
      width,
      height,
      grid,
      axis,
      basic,
      highest,
      cross,
      tooltip,
      volume,
      closingPrice,
      riseColor,
      fallColor,
      flatColor,
      fontSize,
      fontFamily,
      zoomStep
    } as ITimeKProps
  }

  /**
   * 获取分时图
   */
  const getTimeFiveLine = (commonProps: IShareLineProps = {}, time: IShareLineTimeProps | undefined) => {
    if (time === null || time === undefined) {
      return null
    }

    const timeProps: ITimeProps = {
      ...getTimeKProps(commonProps),
      ...(time || {}),
      isFive: time.isFive
    }

    return <TimeLine {...timeProps} />
  }

  /**
   * 获取日 K 图
   */
  const getDailyKLine = (commonProps: IShareLineProps = {}, kProps: IShareLineKProps | undefined) => {
    if (kProps === null || kProps === undefined) {
      return null
    }

    const timeProps: IKProps = {
      ...getTimeKProps(commonProps),
      ...(kProps || {})
    }

    return <KLine {...timeProps} />
  }

  const render = () => {
    const commonProps = getCommonProps()
    return (
      <div
        className={`${commonProps.prefixClassName}-share-chart ${props.className || ''} flex flex-col`}
        style={{
          width: commonProps.width || '',
          height: commonProps.height || ''
        }}
        ref={ref}
      >
        {/* tabs */}
        {getTabNode(commonProps)}

        <div className={`${commonProps.prefixClassName}-share-chart-content flex-1 `}>
          {/* 分时图 */}
          {tabActiveItem.value === TimeKDefaultProps.tabs[0].value && getTimeFiveLine(commonProps, commonProps.time)}

          {/* 五日 */}
          {tabActiveItem.value === TimeKDefaultProps.tabs[1].value &&
            getTimeFiveLine(commonProps, commonProps.fiveTime)}

          {/* 日 K 图*/}
          {tabActiveItem.value === TimeKDefaultProps.tabs[2].value && getDailyKLine(commonProps, commonProps.dailyK)}

          {/* 周 K 图*/}
          {tabActiveItem.value === TimeKDefaultProps.tabs[3].value && getDailyKLine(commonProps, commonProps.weekK)}

          {/* 月 K 图*/}
          {tabActiveItem.value === TimeKDefaultProps.tabs[4].value && getDailyKLine(commonProps, commonProps.monthK)}
        </div>
      </div>
    )
  }

  return render()
}

export default ShareLine
