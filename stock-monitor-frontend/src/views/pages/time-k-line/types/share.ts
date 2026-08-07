/**
 * @fileOverview 输出属性
 * @date 2025-04-28
 * @author poohlaha
 */
import { LineType } from './default'

// x 轴 和 y 轴
export interface IAxisProps {
  className?: string // 自定义样式
  lineColor?: string // 颜色
  textColor?: string // 文字颜色
  xLabels?: Array<string> // x 轴
  yLabels?: Array<string | number> // y 轴
  yPosition?: 'left' | 'right'
  fontSize?: number
  fontFamily?: string
  padding?: number
  needXLabelLine?: boolean // 是否需要 X 轴 文字短线
  needAxisXLine?: boolean // 是否需要 X 轴横线
  needYLabelLine?: boolean // 是否需要 Y 轴文字短线
  needAxisYLine?: boolean // 是否需要 Y 轴坚线
}

export interface IShareAxisProps extends IAxisProps {
  prefixClassName: string
  width: number // 长度
  height: number // 宽度
  isYLeft: boolean
  totalWidth: number
  totalHeight: number
  yAmplitudes: Array<string>
  xPoints: Array<{ [K: string]: any }>
  yPoints: Array<{ [K: string]: any }>
}

// 网格背景属性
export interface IGridProps {
  show?: boolean
  color?: string // 颜色
  lineType?: LineType // 线条类型, 默认为 dashed
  horizontalLines?: number // 水平线条数
  verticalLines?: number // 垂直条数
}

export interface IShareGridProps extends IGridProps {
  prefixClassName: string
  width: number // 长度
  height: number // 宽度
  horizontalLines: number
  isYLeft: boolean
  xPoints: Array<{ [K: string]: any }>
  yPoints: Array<{ [K: string]: any }>
}

// 价格最高线
export interface IHighestProps {
  show?: boolean
  lineColor?: string
  textColor?: string
  lineType?: LineType
}

// 基线属性
export interface IBasicProps extends IHighestProps {
  show?: boolean
  data: number
  lineColor?: string
  textColor?: string
  lineType?: LineType
}

export interface IShareHighestProps extends IHighestProps {
  prefixClassName: string
  width: number
  height: number
  price: number
  fontSize: number
  fontFamily: string
  isAxisLeft: boolean
  hasHighest: boolean
  y: number
  closingPrice: number
  className?: string
  needAnotherSide?: boolean
}

// 十字准线
export interface ICrossProps {
  show?: boolean
  color?: string
  textColor?: string
  textBackgroundColor?: string
  lineType?: LineType
}

export interface IShareCrossProps extends ICrossProps {
  prefixClassName: string
  x: number
  y: number
  width: number
  height: number
  innerHeight: number
  yLeftLabel: string
  yRightLabel: string
  xBottomLabel: string
  fontSize: number
  fontFamily: string
  isAxisLeft: boolean
  closingPrice: number
  yAmplitudes: Array<string>
}

// 成交量柱状图
export interface IVolumeProps {
  show?: boolean
  textColor?: string // 文字颜色
  height?: number
}

export interface IShareVolumeProps extends IVolumeProps {
  prefixClassName: string
  x: number
  y: number
  width: number
  height: number
  color: string
}

// Tooltip
export interface ITooltipProps {
  className?: string
  fontClassName?: string
  show?: boolean
  width?: number
  height?: number
}

export interface IShareTooltipProps extends ITooltipProps {
  prefixClassName: string
  x: number
  y: number
  data: Array<ITooltipDataProps>
}

export interface ITooltipDataProps {
  label: string
  value: string
  color: string
}

// 公共属性
export interface IShareProps {
  prefixClassName?: string // 前缀, 默认为 `time-k`
  className?: string // 自定义样式
  type?: 'canvas' | 'svg' // default svg
  grid?: IGridProps // 网格背景
  axis?: IAxisProps // 坐标轴
  basic?: IBasicProps // 基线
  highest?: IHighestProps // 最高线
  cross?: ICrossProps // 十字准线
  ma?: IKMAProps // 均线
  tooltip?: ITooltipProps // 提示框
  volume?: IVolumeProps // 成交量
  closingPrice?: number // 昨日收盘价
  riseColor?: string // 涨颜色
  fallColor?: string // 跌颜色
  flatColor?: string // 持平颜色
  fontSize?: number // 字体大小
  fontFamily?: string // 字体名称
  zoomStep?: number // 缩放大小
  onGetMoreData?: () => Promise<Array<IKDataItemProps>>
}

// 均线, 5日、10日、20日
export interface IKMAProps {
  className?: string
  fontClassName?: string
  five?: IMAProps // 5日
  ten?: IMAProps // 10日
  twenty?: IMAProps // 20日
}

export interface IMAProps {
  className?: string
  color?: string
}

// 分时图和 K 线图公共属性
export interface ITimeKProps extends IShareProps {
  width: number // 长度
  height: number // 宽度
}

// 分时图数据
export interface ITimeDataItemProps {
  timestamp: number // 时间戳(毫秒)
  price: number // 价格
  volume: number // 成交量
  turnover: number // 成交额
  riseFall?: string | number // 涨跌额
  amplitude?: string | number // 涨跌幅
}

export type IVolumeDataItemProps = ITimeDataItemProps

// K 线图数据
export interface IKDataItemProps {
  timestamp: number // 时间戳(毫秒)
  open: number // 开盘价
  high: number // 当日最高价
  low: number // 当日最低价
  close: number // 收盘价
  volume: number // 成交量(单位: 股)
  turnover: number // 成交量(单位: 元或分, 需看实际单位)
  floatShare?: number // 流通股本(单位:股, 用于换手率计算)
  riseFall?: string | number // 涨跌额
  amplitude?: string | number // 涨跌幅
}

// 分时图和 K 线图整合属性
export interface IShareLineProps extends IShareProps {
  className?: string
  time?: IShareLineTimeProps // 分时
  fiveTime?: IShareLineTimeProps // 五日
  dailyK?: IShareLineKProps // 日K
  weekK?: IShareLineKProps // 周K
  monthK?: IShareLineKProps // 月K
  width?: number // 长度
  height?: number // 宽度
  tabs?: IShareTabsProps // tabs 属性
  zoomStep?: number // 缩放
}

// 分时图属性
export interface IShareLineTimeProps {
  show?: boolean
  isFive?: boolean
  title?: string
  className?: string
  closingPrice?: number
  tradeTimes?: Array<string> // 交易时间段, 如要更改, 请同时更改 xLabels 的值
  data: Array<ITimeDataItemProps> // 数据
  basic?: IBasicProps // 基线
}

// 日K图属性
export interface IShareLineKProps {
  show?: boolean
  title?: string
  className?: string
  closingPrice?: number
  data: Array<IKDataItemProps> // 数据
  basic?: IBasicProps // 基线
  onGetMoreData?: () => Promise<Array<IKDataItemProps>>
}

// tabs 属性
export interface IShareTabsProps {
  activeIndex?: number // 激活的 tab 索引, 默认为 0
  className?: string // 样式
  activeClassName?: string // 选中的样式
  textColor?: string // 文字颜色
  activeTextColor?: string // 选中的文字颜色
  fontClassName?: string // 字体样式
  onTabClick?: (index: number, item: { [K: string]: any }) => void
}

// K 线图最高线|最低线属性
export interface IShareLineKHighLowProps extends IHighestProps {
  lineWidth?: number
  circleColor?: string
}
