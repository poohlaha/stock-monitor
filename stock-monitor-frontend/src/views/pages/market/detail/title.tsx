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
import CommonHtmlHandler from '@views/handlers/common'

interface IMarketDetailTitleProps {
  hasInCollect: boolean
  name: string
  exchange: string
  code: string
  tagList: Array<Record<string, any>>
  type: string
  basicInfo: Record<string, any>
  onAddSelection: (name: string, item: Record<string, any>) => void
}

const MarketDetailTitle = (props: IMarketDetailTitleProps): ReactElement => {
  const render = () => {
    if (Utils.isObjectNull(props.basicInfo || {})) {
      return <div></div>
    }

    const basicInfo = props.basicInfo || {}
    const asset = basicInfo.asset || {}
    const tags = basicInfo.tags || []
    const hasInCollect = props.hasInCollect ?? false
    return (
      <div className="fund-info mt-4 relative">
        <div className="absolute -left-4 top-1.5">{CommonHtmlHandler.getBackNode()}</div>

        <div className="flex-direction-column pl-4 pr-4 rounded-md">
          {/* 标题 */}
          <div className="flex-align-center">
            <div className="flex-align-center">
              {/* logo */}
              {!Utils.isBlank(asset.avatar || '') && (
                <div className="logo mr-2">
                  <img src={asset.avatar || null} className="rounded-full w-14 h-14" />
                </div>
              )}
            </div>

            <div className="flex-direction-column flex-1">
              <div className="flex-align-center">
                <p className="text-3xl font-bold">{asset.name || ''}</p>

                {/* 信息披露 */}
                {!Utils.isBlank(asset.disclosure || '') && (
                  <div className="flex-align-center p-2 rounded-md notice-tag-theme ml-2 text-xs select-none">
                    <img src={NoticePng} className="w-4 h-4 mr-1" />
                    <p>{asset.disclosure || ''}</p>
                  </div>
                )}

                {/* 添加自选 */}
                {!hasInCollect && (
                  <div
                    className="ml-4 tag rounded-md flex-align-center pt-1 pb-1 pl-2 pr-2 cursor-pointer"
                    onClick={() => props.onAddSelection?.(asset.name || '', props.basicInfo || {})}
                  >
                    <svg
                      className="w-4 h-4 color-svg"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M953.37931 512C953.37931 268.232939 755.767084 70.62069 512 70.62069 268.232934 70.62069 70.62069 268.232939 70.62069 512 70.62069 755.767061 268.232934 953.37931 512 953.37931 755.767084 953.37931 953.37931 755.767061 953.37931 512ZM547.310345 476.689655 547.310345 264.858364C547.310345 245.21731 531.501374 229.517241 512 229.517241 492.362681 229.517241 476.689655 245.340001 476.689655 264.858364L476.689655 476.689655 264.858359 476.689655C245.217315 476.689655 229.517241 492.498635 229.517241 512 229.517241 531.637326 245.340001 547.310345 264.858359 547.310345L476.689655 547.310345 476.689655 759.141636C476.689655 778.78269 492.498626 794.482759 512 794.482759 531.637319 794.482759 547.310345 778.659999 547.310345 759.141636L547.310345 547.310345 759.141694 547.310345C778.78272 547.310345 794.482759 531.501365 794.482759 512 794.482759 492.362674 778.660017 476.689655 759.141694 476.689655L547.310345 476.689655ZM0 512C0 229.230209 229.230204 0 512 0 794.769832 0 1024 229.230209 1024 512 1024 794.769791 794.769832 1024 512 1024 229.230204 1024 0 794.769791 0 512Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <p className="ml-1">添加自选</p>
                  </div>
                )}
              </div>
              <div className="flex-align-center mt-1">
                <p className="bg-purple-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1">
                  {props.exchange || ''}
                </p>
                <p className="ml-1 color-gray font-bold">{props.code || ''}</p>
                {/* tags */}
                <div className="tags ml-1 flex-align-center">
                  {(tags || []).map((tag: Record<string, any> = {}, index: number) => {
                    return (
                      <p className="bg-red-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1 mr-1" key={index}>
                        {tag.name || ''}
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
                          {!Utils.isBlank(t.imageUrl || '') && (
                            <img src={t.imageUrl || null} className="w-3 h-3 mr-1" />
                          )}
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
                <p className={`${getRateClassName(basicInfo.latestChange || '-')} font-bold text-3xl h-9`}>
                  {Utils.isBlank(basicInfo.latestChange || '')
                    ? '-'
                    : `${Number(basicInfo.latestChange || 0).toFixed(2)}%` || '-'}
                </p>
                <p className="mt-2">{`日涨幅${basicInfo.latestNavDate || ''}` || '-'}</p>
              </div>

              <div className="ml-6 flex-direction-column flex-center">
                <div className="font-bold text-xl h-9 flex-align-end">{basicInfo.latestNav}</div>
                <p className="mt-2">净值</p>
              </div>

              <div className="ml-6 flex-direction-column flex-center">
                <div
                  className={`font-bold text-xl h-9 flex-align-end ${getRateClassName(basicInfo.oneYearPriceChange?.priceChange || '')}`}
                >
                  {Utils.isBlank(basicInfo.oneYearPriceChange?.priceChange || '')
                    ? '-'
                    : `${Number(basicInfo.oneYearPriceChange?.priceChange || 0).toFixed(2)}%`}
                </div>
                <p className="mt-2">{basicInfo.oneYearPriceChange?.name || '-'}</p>
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
