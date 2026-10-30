/**
 * @fileOverview 标题
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Utils from '@utils/utils'
import { getRateClassName } from '@pages/utils'
import NoticePng from '@assets/images/notice.png'
import CommonHtmlHandler from '@views/handlers/common'
import { Select } from 'antd'

interface IMarketDetailTitleProps {
  hasInCollect: boolean
  name: string
  exchange: string
  code: string
  type: string
  basicInfo: Record<string, any>
  currency: Record<string, any>
  extra: Record<string, any>
  onAddSelection: (name: string, item: Record<string, any>) => void
}

const MarketDetailTitle = (props: IMarketDetailTitleProps): ReactElement => {
  const MARKET_INFO_LIST: Array<Record<string, any>> = [
    {
      label: '当前盘段',
      value: 'current',
      index: 0
    },
    {
      label: '盘前/盘后',
      value: 'outMarketInfo',
      index: 1,
      icon: (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2.526 8.01514C2.44475 7.93389 2.31246 7.9341 2.23108 8.01514L1.72034 8.52588C1.63898 8.60724 1.63898 8.73944 1.72034 8.8208C1.8017 8.90216 1.9339 8.90216 2.01526 8.8208L2.526 8.31006C2.60703 8.22867 2.60725 8.09639 2.526 8.01514ZM5.27112 2.31299C3.63728 2.31299 2.31213 3.63716 2.31213 5.271C2.31222 6.90476 3.63733 8.229 5.27112 8.229C6.90475 8.22883 8.22904 6.90465 8.22913 5.271C8.22913 3.63727 6.90481 2.31316 5.27112 2.31299ZM1.1803 5.06299H0.458618C0.34356 5.06299 0.249634 5.15594 0.249634 5.271C0.249721 5.38598 0.343613 5.479 0.458618 5.479H1.1803C1.29527 5.47896 1.38822 5.38595 1.38831 5.271C1.38831 5.15596 1.29532 5.06303 1.1803 5.06299ZM2.01526 1.72021C1.93395 1.63906 1.80166 1.63908 1.72034 1.72021C1.63903 1.80152 1.63913 1.93377 1.72034 2.01514L2.23108 2.52588C2.31245 2.60709 2.44469 2.60719 2.526 2.52588C2.60713 2.44455 2.60716 2.31227 2.526 2.23096L2.01526 1.72021Z"
            stroke="#B7B9C1"
            stroke-width="0.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
          <path
            d="M5.27079 0C5.01766 0 4.81246 0.205203 4.81246 0.458333V1.18021C4.81246 1.43334 5.01766 1.63854 5.27079 1.63854C5.52392 1.63854 5.72913 1.43334 5.72913 1.18021V0.458333C5.72913 0.205203 5.52392 0 5.27079 0Z"
            fill="#FF8200"
          ></path>
          <path
            d="M8.34966 1.54391C8.52865 1.36492 8.81885 1.36492 8.99784 1.54391C9.17683 1.7229 9.17683 2.0131 8.99784 2.19209L8.48739 2.70254C8.3084 2.88153 8.0182 2.88153 7.83921 2.70254C7.66022 2.52355 7.66022 2.23335 7.83921 2.05436L8.34966 1.54391Z"
            fill="#FF8200"
          ></path>
          <path
            d="M10.0833 4.8125C10.3364 4.8125 10.5416 5.0177 10.5416 5.27083C10.5416 5.52396 10.3364 5.72917 10.0833 5.72917H9.36142C9.10829 5.72917 8.90308 5.52396 8.90308 5.27083C8.90308 5.0177 9.10829 4.8125 9.36142 4.8125H10.0833Z"
            fill="#FF8200"
          ></path>
          <path
            d="M7.83921 7.83883C7.66022 8.01782 7.66022 8.30803 7.83921 8.48701L8.34966 8.99746C8.52865 9.17645 8.81885 9.17645 8.99784 8.99746C9.17683 8.81847 9.17683 8.52827 8.99784 8.34928L8.48739 7.83883C8.3084 7.65984 8.0182 7.65984 7.83921 7.83883Z"
            fill="#FF8200"
          ></path>
          <path
            d="M8.47913 5.27083C8.47913 3.49892 7.0427 2.0625 5.27079 2.0625V5V8.47917C7.0427 8.47917 8.47913 7.04274 8.47913 5.27083Z"
            fill="#FF8200"
          ></path>
          <path
            d="M4.81246 9.36165C4.81246 9.10852 5.01766 8.90332 5.27079 8.90332C5.52392 8.90332 5.72913 9.10852 5.72913 9.36165V10.0835C5.72913 10.3367 5.52392 10.5419 5.27079 10.5419C5.01766 10.5419 4.81246 10.3367 4.81246 10.0835V9.36165Z"
            fill="#FF8200"
          ></path>
        </svg>
      )
    },
    {
      label: '夜盘行情',
      value: 'nightMarketInfo',
      index: 2,
      icon: (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.51208 0.0941531C4.25856 0.420968 3.33334 1.56076 3.33334 2.91667C3.33334 4.52751 4.63916 5.83332 6.24999 5.83332C7.6059 5.83332 8.74571 4.90811 9.0725 3.65459C9.13424 3.9545 9.16667 4.26514 9.16667 4.58333C9.16667 7.11464 7.11464 9.16667 4.58333 9.16667C2.05203 9.16667 0 7.11464 0 4.58333C0 2.05203 2.05203 0 4.58333 0C4.90153 0 5.21217 0.0324248 5.51208 0.0941531Z"
            fill="#4E6EF2"
          ></path>
        </svg>
      )
    }
  ]

  const [activeMarketInfoIndex, setActiveMarketInfoIndex] = useState(MARKET_INFO_LIST[0].index)

  // 获取当前盘段
  const getCurrentMarket = () => {
    debugger
    let tradeStatus = (props.currency?.tradeStatus || '').toUpperCase()
    let tradeStatusText = props.currency?.tradeStatusCN || ''
    let label = ''
    let icon = null
    let selectMarketInfoValue = ''

    if (tradeStatus === 'NIGHT') {
      label = 'nightMarketInfo'
      icon = MARKET_INFO_LIST[2].icon
      selectMarketInfoValue = MARKET_INFO_LIST[2].value
    }

    if (tradeStatus === 'PRETR') {
      label = 'preMarketInfo'
      icon = MARKET_INFO_LIST[1].icon
      selectMarketInfoValue = MARKET_INFO_LIST[1].value
    }

    if (tradeStatus === 'POST') {
      label = 'postMarketInfo'
      icon = MARKET_INFO_LIST[1].icon
      selectMarketInfoValue = MARKET_INFO_LIST[1].value
    }

    return {
      tradeStatusText,
      ...((props.extra || {})[label] || {}),
      selectMarketInfoValue,
      icon
    }
  }

  const getSelectMarket = (marketInfoIndex: number = 0): Record<string, any> => {
    // 盘前/盘后
    if (marketInfoIndex === MARKET_INFO_LIST[1].index) {
      let obj = (props.extra || {})[MARKET_INFO_LIST[1].value] || {}
      let tradeStatusText = obj.tradeSectionCN || {}
      return {
        tradeStatusText,
        ...obj,
        selectMarketInfoValue: MARKET_INFO_LIST[1].value || '',
        icon: MARKET_INFO_LIST[1].icon
      }
    }

    // 夜盘行情
    if (marketInfoIndex === MARKET_INFO_LIST[2].index) {
      let obj = (props.extra || {})[MARKET_INFO_LIST[1].value] || {}
      let tradeStatusText = obj.tradeSectionCN || {}
      return {
        tradeStatusText,
        ...obj,
        selectMarketInfoValue: MARKET_INFO_LIST[2].value || '',
        icon: MARKET_INFO_LIST[2].icon
      }
    }

    // 当前盘段
    return getCurrentMarket()
  }

  const render = () => {
    if (Utils.isObjectNull(props.basicInfo || {})) {
      return <div></div>
    }

    const basicInfo = props.basicInfo || {}
    const asset = basicInfo.asset || {}
    const tags = basicInfo.tags || []
    const hasInCollect = props.hasInCollect ?? false
    debugger
    const hasExtra = !Utils.isObjectNull(props.extra || {})
    const selectMarket = getSelectMarket(activeMarketInfoIndex) || {}
    console.log('select market: ', selectMarket)

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

                {/* 行业等标签 */}
                {(tags || []).length > 0 && (
                  <div className="flex-align-center">
                    {(tags || []).map((t: Record<string, any> = {}, index: number) => {
                      return (
                        <div className="flex-align-center ml-1 cursor-pointer" key={index}>
                          {!Utils.isBlank(t.img || '') && <img src={t.img || null} className="w-3 h-3 mr-1" />}
                          <p>{t.name || ''}</p>
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
            <div className="mt-4 flex-align-center">
              <div className="flex-direction-column">
                <div className="flex-align-end">
                  <p className={`text-4xl font-bold ${getRateClassName(props.currency?.ratio)}`}>
                    {props.currency?.price || 0}
                  </p>
                  <p className={`ml-1 ${getRateClassName(props.currency?.ratio)}`}>{props.currency?.unit || ''}</p>
                  <p className={`ml-2 font-bold ${getRateClassName(props.currency?.increase)}`}>
                    {props.currency?.increase || 0}
                  </p>
                  <p className={`ml-2 font-bold ${getRateClassName(props.currency?.ratio)}`}>
                    {props.currency?.ratio || 0}
                  </p>
                </div>

                <div className="flex-align-center mt-2">
                  <p className="text-purple-500">{props.currency?.stockStatus || ''}</p>
                  <p className="ml-1">{props.currency?.text || Utils.formatDate(new Date())}</p>
                  <p className="ml-1">{props.currency?.timezone || ''}</p>
                </div>
              </div>

              {hasExtra && (
                <div className="flex-direction-column ml-36">
                  <div className="flex-align-end">
                    <p className={`text-4xl font-bold ${getRateClassName(selectMarket.ratio)}`}>
                      {selectMarket.price || 0}
                    </p>
                    <p className={`ml-1 ${getRateClassName(props.currency?.ratio)}`}>{props.currency?.unit || ''}</p>
                    <p className={`ml-2 font-bold ${getRateClassName(selectMarket.increase)}`}>
                      {selectMarket.increase || 0}
                    </p>
                    <p className={`ml-2 font-bold ${getRateClassName(selectMarket.ratio)}`}>
                      {selectMarket.ratio || 0}
                    </p>
                  </div>

                  <div className="flex-align-end">
                    <div className="flex-align-center mt-2">
                      <div className="text-purple-500 flex-align-center">
                        {selectMarket.icon && <div className="mr-1 w-4 h-4">{selectMarket.icon}</div>}

                        <Select
                          style={{ width: 120 }}
                          value={selectMarket.selectMarketInfoValue || undefined}
                          onChange={() => {}}
                          options={MARKET_INFO_LIST || []}
                        />
                      </div>
                      <p className="ml-1">{selectMarket.time || Utils.formatDate(new Date())}</p>
                      <p className="ml-1">{props.currency?.timezone || ''}</p>
                    </div>
                  </div>
                </div>
              )}
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
