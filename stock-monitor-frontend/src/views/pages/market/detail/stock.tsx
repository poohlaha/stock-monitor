/**
 * @fileOverview 股票信息
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import {Popover, Tabs} from 'antd'
import { useStore } from '@views/stores'
import Utils from '@utils/utils'
import {getRateClassName} from "@pages/utils";

const MarketDetailStock = (): ReactElement => {
  const { marketStore } = useStore()
  // const navigate = useNavigate()

  const getArrowSvg = () => {
    return (
        <svg
            className="wh100"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
        >
          <path
              d="M562.005333 512l-211.2-211.2 60.330667-60.288L682.666667 512l-271.530667 271.530667-60.330667-60.373334 211.2-211.2z"
              fill="currentColor"
          ></path>
        </svg>
    )
  }

  const getIndustryFundFlowTabChildren = (data: Record<string, any> = {}) => {
    const todayMainFlow = data.todayMainFlow || {}
    const titleLabel = Number(todayMainFlow.mainNetIn) > 0 ? '流入' : '流出'
    const superGrp = data.superGrp || {} // 特大单
    const largeGrp = data.largeGrp || {} // 大单
    const mediumGrp = data.mediumGrp || {} // 中单
    const littleGrp = data.littleGrp || {} // 小单
    const largest = Math.max(
        Math.abs(Number(superGrp.netTurnover || '0')),
        Math.abs(Number(largeGrp.netTurnover || '0')),
        Math.abs(Number(mediumGrp.netTurnover || '0')),
        Math.abs(Number(littleGrp.netTurnover || '0')),
    )

    const items = [
      {
        name: '特大单',
        value: Number(superGrp.netTurnover || '0'),
        className: getRateClassName(superGrp.netTurnover || 0),
        ...(superGrp || {})
      },
      {
        name: '大单',
        value: Number(largeGrp.netTurnover || '0'),
        className: getRateClassName(largeGrp.netTurnover || 0),
        ...(largeGrp || {})
      },
      {
        name: '中单',
        value: Number(mediumGrp.netTurnover || '0'),
        className: getRateClassName(mediumGrp.netTurnover || 0),
        ...(mediumGrp || {})
      },
      {
        name: '小单',
        value: Number(littleGrp.netTurnover || '0'),
        className: getRateClassName(littleGrp.netTurnover || 0),
        ...(littleGrp || {})
      },
    ]
    const getWidth = (value: number) => `${Math.abs(value) / largest * 100}%`

    const recentList = data.recently || []

    return (
      <div className="flex-direction-column">
        <div className="flex-align-center">
          <div className="flex-align-center flex-1">
            <div className="">主力净{titleLabel}总计</div>
            <p className={`ml-4 ${getRateClassName(todayMainFlow.mainNetIn || 0)}`}>{todayMainFlow.mainNetIn || 0}</p>
          </div>

          <div className="flex-align-center">
            <p className="mr-1">行业排行</p>

            <div className="w-4 h-4">
              {getArrowSvg()}
            </div>
          </div>
        </div>

        <div className="flex-direction-column mt-2">
          <div className="color-gray text-xs flex-align-center">
            <p className="flex-1">类别</p>
            <p className="flex-1 max-w-[200px]"></p>
            <p className="flex-1">净流入</p>
            <p className="flex-1">流入</p>
            <p className="flex-1">流出</p>
          </div>

          {
            items.map((l: Record<string, any> = {}, index: number) => {
              return (
                  <div className="flex-align-center h-8 border-bottom" key={index}>
                    <div className="flex-align-center pr-1 flex-1">
                      <p className="">{l.name}</p>
                    </div>
                    <div className="flex-1 h-4 pr-4 max-w-[200px]">
                      <p className={`${l.value > 0 ? 'bg-red-600' : 'bg-emerald-700'} h100 rounded-md max-[267px]`} style={{
                        width: getWidth(l.value)
                      }}></p>
                    </div>
                    <p className={`flex-1 ${getRateClassName(l.netTurnover || 0)} pr-1 font-bold`}>{l.netTurnover || 0}</p>
                    <p className="flex-1 pr-1">{l.turnoverIn || 0}</p>
                    <p className="flex-1 pr-1">{l.turnoverOut || 0}</p>
                  </div>
              )
            })
          }

          <div className="mt-2 w100 flex-align-center">
            {
              (recentList || []).map((recent: Record<string, any> = {}, index: number) => {
                return (
                    <div className="flex-direction-column flex-1 pr-1" key={index}>
                      <p>{recent.key || ''}</p>
                      <p className={`${getRateClassName(recent.value || '0')} mt-1 font-bold`}>{recent.value || ''}</p>
                    </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }

  const getIndustryFundFlowTabItems = () => {
    if (Utils.isObjectNull(marketStore.industryFundFlow || {})) {
      return []
    }

    const result = (marketStore.industryFundFlow.fundFlowBlock || {}).result || []
    if (result.length === 0) {
      return []
    }

    const items = []
    for (let i = 0; i < result.length; i++) {
      const r = result[i] || {}
      const industry = r.industry || {}
      if (Utils.isObjectNull(industry)) {
        continue
      }

      items.push({
        key: `${i}`,
        label: `${industry.name}(${industry.desc})`,
        children: getIndustryFundFlowTabChildren(r)
      })
    }

    return items
  }

  // 资金分布
  const getZJFBNode = () => {
    const result = ((marketStore.industryFundFlow || {}).fundFlowSpread || {}).result || {}
    const analysis = result.analysis || {}

    return (
        <div className="flex-direction-column flex-1">
          <div className="flex-align-center flex-jsc-between">
            <div className="flex-align-center pr-2">
              <p className="font-bold text-lg mr-1">资金分布</p>
              <Popover
                  trigger={['hover']}
                  classNames={{
                    root: 'm-table-sortable-popover'
                  }}
                  placement="bottomRight"
                  arrow={false}
                  content={(
                      <div className="flex-direction-column">
                        <p>将历史逐笔成交数据按照订单之间一定的大小数量级关系计算阈值，按阈值划分为特大单、大单、中单、小单。</p>
                        <p className="text-xs color-gray">特此说明：此功能仅提供客观统计结果，不构成任何投资建议。</p>
                      </div>
                  )}
              >
                <svg className="w-6 h-6 color-gray" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 170.666667C324.266667 170.666667 170.666667 324.266667 170.666667 512s153.6 341.333333 341.333333 341.333333 341.333333-153.6 341.333333-341.333333S699.733333 170.666667 512 170.666667z m0 640c-164.266667 0-298.666667-134.4-298.666667-298.666667s134.4-298.666667 298.666667-298.666667 298.666667 134.4 298.666667 298.666667-134.4 298.666667-298.666667 298.666667z" fill="#3D3D3D" p-id="12800"></path><path d="M512 448c-12.8 0-21.333333 8.533333-21.333333 21.333333v213.333334c0 10.666667 8.533333 21.333333 21.333333 21.333333s21.333333-8.533333 21.333333-21.333333V469.333333c0-10.666667-8.533333-21.333333-21.333333-21.333333zM512 320c-12.8 0-21.333333 10.666667-21.333333 21.333333v42.666667c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-10.666667 21.333333-21.333333v-42.666667c0-12.8-8.533333-21.333333-21.333333-21.333333z" fill="currentColor"></path></svg>
              </Popover>
                <p className="ml-4 color-gray">单位：亿</p>
            </div>

            <div className="flex-align-center">
              <p>更新时间: </p>
              <p className="ml-1">{result.updateTime || '-'}</p>
            </div>
          </div>

          {
              (analysis.list || []).length > 0 && (
                  <div className="flex-direction-column w100 mt-2">
                    <div className="flex-align-center w100">
                      {
                        (analysis.list || []).map((l: Record<string, any> = {}, index: number) => {
                          return (
                              <div className={`text-xs flex-jsc-between flex-1 ${index !== (analysis.list || []).length - 1 ? 'pr-4' : '' }`} key={index}>
                                <p>{l.desc || ''}</p>
                                <p className={`${index === (analysis.list || []).length - 1 ? 'theme-color' : ''}`}>{l.content || '-'}</p>
                                {
                                  index === (analysis.list || []).length - 1 && (
                                        <div className="w-2 h-2 theme-color">
                                          {getArrowSvg()}
                                        </div>
                                  )
                                }
                              </div>
                          )
                        })
                      }
                    </div>
                  </div>
              )
          }

          {
            !Utils.isBlank(analysis.content || '') && (
                <div className="p-2 notice rounded-md mt-2">
                  <p>{analysis.content || ''}</p>
                </div>
              )
          }
        </div>
    )
  }

  const render = () => {

    return (
      <div className="mt-4 flex-direction-column">

        <div className="flex-wrap">
          {/* 资金分布 */}
          {getZJFBNode()}

        </div>

        {/* 所属行业资金流向 */}
        <div className="mt-4">
          <p className="font-bold text-lg">所属行业资金流向</p>
          <div className="mt-4">
            <Tabs className="m-ant-tabs" items={getIndustryFundFlowTabItems()} />
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailStock)
