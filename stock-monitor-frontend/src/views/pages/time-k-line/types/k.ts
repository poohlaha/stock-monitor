/**
 * @fileOverview K线图输出属性
 * @date 2025-05-07
 * @author poohlaha
 */
import { IKDataItemProps, IShareLineKHighLowProps, ITimeKProps } from './share'

/**
 * data
 * [
 *   时间戳, // 例如 1745459460000
 *   开盘价, // 例如 8.16
 *   当日最高价, // 7.05
 *   当日最低价,  // 7.16
 *   收盘价,  // 6.96
 *   成交量(单位：股),  // 9909992
 *   成交额(单位：元或分，需看实际单位),  // 70335157
 * ]
 */
export interface IKProps extends ITimeKProps {
  data: Array<IKDataItemProps> // 数据
  high?: IShareLineKHighLowProps // 最高线属性
  low?: IShareLineKHighLowProps // 最低线
}
