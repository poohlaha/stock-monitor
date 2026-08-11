/**
 * @fileOverview 股票持仓/债券持仓
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { getRateClassName } from '@pages/utils'

interface IMarketDetailPositionProps {
  position: Record<string, any>
  onStockClick: (stock: Record<string, any>) => void
}

const MarketDetailPosition = (props: IMarketDetailPositionProps): ReactElement => {
  const render = () => {
    return (
      <div className="stock-position-box min-w-[400px] pl-4 pr-4 pb-4 flex-direction-column">
        <p className="font-bold text-base mb-2">
          {(((props.position || {}).heavyStock || {}).titleHeader || []).length > 0
            ? ((props.position || {}).heavyStock || {}).titleHeader[0] || ''
            : '股票持仓'}
        </p>
        <div className="stock-position-header flex-align-center h-6 text-xs bg-[#fff4e4] pl-4 pr-4 rounded-md">
          <p className="flex-1 text-center">股票名称</p>
          <p className="flex-1 text-center">涨跌幅</p>
          <p className="flex-1 text-center">持仓占比</p>
        </div>

        {/* 十大重仓 */}
        <div className="stock-position-body flex-align-center w100 tex-xs flex-direction-column mt-2">
          {(((props.position || {}).heavyStock || {}).body || []).map((b: Record<string, any> = {}, index: number) => {
            return (
              <div className="flex-align-center h-8 w100 bg-line-hover pl-4 pr-4 rounded-md" key={index}>
                <p className="flex-1 text-center theme-hover cursor-pointer" onClick={() => props.onStockClick?.(b)}>
                  {b.name || '-'}
                </p>
                <p className={`flex-1 text-center ${getRateClassName(b.proportionRatio || '-')}`}>
                  {b.proportionRatio || '-'}
                </p>
                <p className="flex-1 text-center">{b.positionProportion || '-'}</p>
              </div>
            )
          })}
        </div>

        {/* 债券 */}
        {(((props.position || {}).heavyBond || {}).body || []).length > 0 && (
          <div className="mt-4">
            <p className="font-bold text-base mb-2">
              {(((props.position || {}).heavyStock || {}).titleHeader || []).length > 0
                ? ((props.position || {}).heavyBond || {}).titleHeader[0] || ''
                : '债券持仓'}
            </p>
            <div className="flex-align-center h-6 text-xs bg-[#fff4e4] pl-4 pr-4">
              <p className="flex-1 text-center">债券名称</p>
              <p className="flex-1 text-center">持仓占比</p>
            </div>

            <div className="stock-position-body flex-align-center w100 tex-xs flex-direction-column mt-2">
              {(((props.position || {}).heavyBond || {}).body || []).map((b: Array<string> = [], index: number) => {
                return (
                  <div className="flex-align-center h-8 w100 bg-line-hover pl-4 pr-4 rounded-md" key={index}>
                    <p className="flex-1 text-center">{b[0] || '-'}</p>
                    <p className="flex-1 text-center">{b[1] || '-'}</p>
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
