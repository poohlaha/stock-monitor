/**
 * @fileOverview 股票持仓/债券持仓
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { getRateClassName } from '@pages/utils'

interface IMarketDetailPositionProps {
  holding: Array<Record<string, any>>
  onStockClick: (stock: Record<string, any>) => void
}

const MarketDetailPosition = (props: IMarketDetailPositionProps): ReactElement => {
  // 获取比例
  const getProportion = (list: Array<Record<string, any>> = []) => {
    if (list.length === 0) {
      return ''
    }

    const total = list.reduce((sum, item) => {
      return sum + Number(item.proportion || 0)
    }, 0)

    return `(${total}%)`
  }

  const render = () => {
    const stockList = (props.holding || []).filter((h: Record<string, any> = {}) => h.holdingType === 'stock') || []
    const bondList = (props.holding || []).filter((h: Record<string, any> = {}) => h.holdingType === 'bond') || []
    return (
      <div className="stock-position-box min-w-[400px] w-[400px] pl-4 pr-4 pb-4 flex-direction-column">
        <p className="font-bold text-base mb-2">股票持仓{getProportion(stockList || [])}</p>
        <div className="stock-position-header flex-align-center h-6 min-h-6 text-xs bg-[#fff4e4] pl-4 pr-4 rounded-md">
          <p className="flex-1 text-center">股票名称</p>
          <p className="flex-1 text-center">涨跌幅</p>
          <p className="flex-1 text-center">持仓占比</p>
        </div>

        {/* 十大重仓 */}
        <div className="stock-position-body flex-align-center w100 tex-xs flex-direction-column mt-2 max-h-[350px] overflow-y-auto no-scrollbar">
          {(stockList || []).map((b: Record<string, any> = {}, index: number) => {
            return (
              <div className="flex-align-center min-h-8 pt-2 pb-2 w100 bg-line-hover pl-4 pr-4 rounded-md" key={index}>
                <p className="flex-1 text-center theme-hover cursor-pointer" onClick={() => props.onStockClick?.(b)}>
                  {b.targetName || '-'}
                </p>
                <p className={`flex-1 text-center ${getRateClassName(b.priceChange || '-')}`}>
                  {Number(b.priceChange || '0').toFixed(2)}%
                </p>
                <p className="flex-1 text-center">{Number(b.proportion || '0').toFixed(2)}%</p>
              </div>
            )
          })}
        </div>

        {/* 债券 */}
        {(bondList || []).length > 0 && (
          <div className="mt-4">
            <p className="font-bold text-base mb-2">债券持仓{getProportion(bondList || [])}</p>
            <div className="flex-align-center h-6 min-h-6 text-xs bg-[#fff4e4] pl-4 pr-4">
              <p className="flex-1 text-center">债券名称</p>
              <p className="flex-1 text-center">持仓占比</p>
            </div>

            <div className="stock-position-body flex-align-center w100 tex-xs flex-direction-column mt-2 max-h-[100px] overflow-y-auto no-scrollbar">
              {(bondList || []).map((b: Record<string, any> = {}, index: number) => {
                return (
                  <div
                    className="flex-align-center min-h-8 pt-2 pb-2 w100 bg-line-hover pl-4 pr-4 rounded-md"
                    key={index}
                  >
                    <p className="flex-1 text-center">{b.targetName || '-'}</p>
                    <p className="flex-1 text-center">{Number(b.proportion || '0').toFixed(2)}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailPosition)
