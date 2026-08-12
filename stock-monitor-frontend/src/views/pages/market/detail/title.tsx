/**
 * @fileOverview 标题
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import Utils from '@utils/utils'
import { getRateClassName } from '@pages/utils'
import NoticePng from '@assets/images/notice.png'

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
    console.log('basicInfo: ', props.basicInfo || {})
    if (Utils.isObjectNull(props.basicInfo || {})) {
      return <div></div>
    }

    return (
      <div className="fund-info mt-4">
        <div className="flex-direction-column pl-4 pr-4 rounded-md">
          {/* 标题 */}
          <div className="flex-align-center">
            <div className="flex-align-center">
              {/* logo */}
              {!Utils.isBlank(props.basicInfo?.logo || '') && (
                <div className="logo mr-2">
                  <img src={props.basicInfo?.logo || ''} className="rounded-full w-14 h-14" />
                </div>
              )}
            </div>

            <div className="flex-direction-column">
              <div className="flex-align-center">
                <p className="text-3xl font-bold">{props.name || ''}</p>

                {/* 信息披露 */}
                {!Utils.isObjectNull(props.basicInfo?.financeReport || {}) && (
                  <div className="flex-align-center p-2 rounded-md notice-tag-theme ml-2 text-xs select-none">
                    <img src={NoticePng} className="w-4 h-4 mr-1" />
                    <p>{(props.basicInfo?.financeReport || {}).text || ''}</p>
                  </div>
                )}
              </div>
              <div className="flex-align-center mt-1">
                <p className="bg-purple-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1">
                  {Utils.isBlank(props.exchange || '') ? props.basicInfo?.exchange || '' : props.exchange || ''}
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
                <p className={`${getRateClassName(props.basicInfo?.railFallNewest?.value)} font-bold text-3xl h-9`}>
                  {props.basicInfo?.railFallNewest?.value || '-'}
                </p>
                <p className="mt-2">{props.basicInfo?.railFallNewest?.text || '-'}</p>
              </div>

              <div className="ml-6 flex-direction-column flex-center">
                <div className="font-bold text-xl h-9 flex-align-end">{props.basicInfo?.priceNewest?.value}</div>
                <p className="mt-2">{props.basicInfo?.priceNewest?.text || '-'}</p>
              </div>

              <div className="ml-6 flex-direction-column flex-center">
                <div
                  className={`font-bold text-xl h-9 flex-align-end ${getRateClassName(props.basicInfo?.ratioNewest?.value)}`}
                >
                  {props.basicInfo?.ratioNewest?.value}
                </div>
                <p className="mt-2">{props.basicInfo?.ratioNewest?.text || '-'}</p>
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
