/**
 * @fileOverview 标题
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import Utils from '@utils/utils'
import { getRateClassName } from '@pages/utils'

interface IMarketDetailTitleProps {
  name: string
  exchange: string
  code: string
  tags: Array<Record<string, any>>
  tagList: Array<Record<string, any>>
  type: string
  basicInfo: Record<string, any>
}

const MarketDetailTitle = (props: IMarketDetailTitleProps): ReactElement => {
  const render = () => {
    return (
      <div className="fund-info mt-4">
        <div className="flex-direction-column pl-4 pr-4 rounded-md">
          {/* 标题 */}
          <div className="flex-direction-column">
            <p className="text-3xl font-bold">{props.name || ''}</p>
            <div className="flex-align-center mt-1">
              <p className="bg-purple-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1">
                {props.exchange || ''}
              </p>
              <p className="ml-1 color-gray font-bold">{props.code || ''}</p>
              {/* tags */}
              <div className="tags ml-1 flex-align-center">
                {(props.tags || []).map((tag: Record<string, any> = {}, index: number) => {
                  return (
                    <p className="bg-red-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1 mr-1" key={index}>
                      {tag.text || ''}
                    </p>
                  )
                })}
              </div>

              {/* 行业等标签 */}
              {(props.tagList || []).length > 0 && (
                <div className="flex-align-center">
                  {(props.tagList || []).map((t: Record<string, any> = {}, index: number) => {
                    return (
                      <div className="flex-align-center ml-1 cursor-pointer" key={index}>
                        {!Utils.isBlank(t.imageUrl || '') && <img src={t.imageUrl || ''} className="w-3 h-3 mr-1" />}
                        <p>{t.desc || ''}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 基金净值等信息 */}
          {props.type !== 'fund' && (
            <div className="mt-4 flex-direction-column">
              <div className="flex-align-end">
                <p className={`text-4xl font-bold ${getRateClassName(props.basicInfo?.ratio)}`}>
                  {props.basicInfo?.price || 0}
                </p>
                <p className={`ml-1 ${getRateClassName(props.basicInfo?.ratio)}`}>元</p>
                <p className={`ml-2 font-bold ${getRateClassName(props.basicInfo?.increase)}`}>
                  {props.basicInfo?.increase || 0}
                </p>
                <p className={`ml-2 font-bold ${getRateClassName(props.basicInfo?.ratio)}`}>
                  {props.basicInfo?.ratio || 0}
                </p>
              </div>

              <div className="flex-align-center mt-2">
                <p className="text-purple-500">{props.basicInfo?.tradeStatusCN || ''}</p>
                <p className="ml-1">{Utils.formatDate(new Date())}</p>
                <p className="ml-1">{props.basicInfo?.timezone || ''}</p>
              </div>
            </div>
          )}

          {props.type === 'fund' && (
            <div className="mt-4 flex-align-center h-16">
              <div className="flex-direction-column flex-center">
                <p className={`${getRateClassName(props.basicInfo?.railFall?.value)} font-bold text-3xl h-9`}>
                  {props.basicInfo?.railFall?.value || '-'}
                </p>
                <p className="mt-2">{props.basicInfo?.railFall?.text || '-'}</p>
              </div>

              <div className="ml-6 flex-direction-column flex-center">
                <div className="font-bold text-xl h-9 flex-align-end">{props.basicInfo?.price?.value}</div>
                <p className="mt-2">{props.basicInfo?.price?.text || '-'}</p>
              </div>

              <div className="ml-6 flex-direction-column flex-center">
                <div className={`font-bold text-xl h-9 flex-align-end ${getRateClassName(props.basicInfo?.ratio?.value)}`}>
                  {props.basicInfo?.ratio?.value}
                </div>
                <p className="mt-2">{props.basicInfo?.ratio?.text || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailTitle)
