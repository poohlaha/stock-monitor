/**
 * @fileOverview 分时图输出属性
 * @date 2025-04-24
 * @author poohlaha
 */
// 定义分时图属性
import { ITimeKProps, ITimeDataItemProps } from './share'

/**
 * data
 * [
 *   时间戳, // 例如 1745459460000
 *   当前价格, // 例如 8.16
 *   成交量, // 25047000
 *   成交额  // 206046740
 * ]
 */
export interface ITimeProps extends ITimeKProps {
  isFive?: boolean
  data: Array<ITimeDataItemProps> // 数据
  tradeTimes?: Array<string> // 交易时间段, 如要更改, 请同时更改 xLabels 的值
}

// 早上 120 分钟, 下午 120 分钟, 共计 240 分钟
export const TRADE_TIMES = ['9:30~11:30', '13:00~15:00']
