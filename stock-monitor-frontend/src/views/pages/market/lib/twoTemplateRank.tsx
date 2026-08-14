/**
 * @fileOverview 一列两行
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import UpPng from '@assets/images/up.png'
import DownPng from '@assets/images/down.png'
import Utils from '@utils/utils'
import { getRateClassName } from '@pages/utils'

interface ITwoTemplateRankProps {
  type: number // 1, 2, 3: A股, 美股等, 4: 排行
  list: Array<Record<string, any>>
  onAddSelection?: (item: Record<string, any>) => void // 加自选
}

const TwoTemplateRank = (props: ITwoTemplateRankProps): ReactElement => {
  const render = () => {
    return (
      <div className="two-template-rank flex-direction-column">
        <div className="grid grid-cols-2 gap-x-5">
          {/* 左侧表头 */}
          <div className="flex-align-center color-gray h-8 min-h-8">
            <p className="w-16 text-c pl-2">排名</p>
            <p className="flex-2 text-l">名称/代码</p>
            {props.type === 4 && (
              <>
                <p className="flex-1 text-r">最新价</p>
                <p className="flex-1 text-r">涨跌幅</p>
                <p className="flex-1 text-r">加自选</p>
              </>
            )}
            {props.type === 1 && (
              <>
                <p className="flex-1 text-r">涨跌幅</p>
                <p className="flex-1 text-r pr-2">热度</p>
              </>
            )}

            {props.type === 2 && <p className="flex-1 text-r pr-2">综合评分</p>}
            {props.type === 3 && (
              <>
                <p className="flex-1 text-r">持股机构数</p>
                <p className="flex-1 text-r pr-2">持股总数</p>
              </>
            )}
          </div>

          {/* 右侧表头 */}
          <div className="flex-align-center color-gray">
            <p className="w-16 text-c pl-2">排名</p>
            <p className="flex-2 text-l">名称/代码</p>
            {props.type === 4 && (
              <>
                <p className="flex-1 text-r">最新价</p>
                <p className="flex-1 text-r">涨跌幅</p>
                <p className="flex-1 text-r pr-2">加自选</p>
              </>
            )}
            {props.type === 1 && (
              <>
                <p className="flex-1 text-r">涨跌幅</p>
                <p className="flex-1 text-r pr-2">热度</p>
              </>
            )}

            {props.type === 2 && <p className="flex-1 text-r pr-2">综合评分</p>}
          </div>

          {(props.list || []).map((l: Record<string, any> = {}, index: number) => {
            const rankDiff = l.rankDiff
            let logo = l.logo || ''
            if (typeof logo !== 'string') {
              logo = logo.logo || ''
            }
            return (
              <div
                className="flex-1 h-16 border-bottom bg-line-hover flex-align-center min-h-16 hover:rounded-md"
                key={index}
              >
                <div className="flex-direction-column w-16 pl-2">
                  <p
                    className="font-bold text-base text-c"
                    style={{
                      color: l.color || ''
                    }}
                  >
                    {index + 1}
                  </p>
                  {rankDiff !== '-' && (
                    <div className="mt-1 flex-center">
                      {rankDiff > 0 && (
                        <div className="flex-align-center">
                          <img src={UpPng} className="w-w h-2" />
                          <p className="pl-0.5 text-xs">{rankDiff > 99 ? '99+' : rankDiff}</p>
                        </div>
                      )}
                      {rankDiff < 0 && (
                        <div className="flex-align-center">
                          <img src={DownPng} className="w-w h-2" />
                          <p className="pl-0.5 text-xs">{rankDiff}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-2 text-l flex-align-center">
                  {!Utils.isBlank(logo || '') && (
                    <img src={logo || ''} className="w-10 h-10 mr-2 rounded-full border" />
                  )}
                  <div className="flex-direction-column">
                    <p className="font-bold">{l.name || ''}</p>
                    <div className="mt-1 flex-align-center text-xs">
                      {!Utils.isBlank(l.exchange || '') && (
                        <p className="bg-[#00add7] p-0.5 mr-1 text-white rounded">{l.exchange || ''}</p>
                      )}
                      <p className="">{l.code || ''}</p>
                      {!Utils.isBlank(l.tag || '') && <p className="notice p-0.5">{l.tag || ''}</p>}
                    </div>
                  </div>
                </div>
                {props.type === 1 && (
                  <>
                    <p className={`flex-1 pr-2 text-r font-bold ${getRateClassName(l.rate || '-')}`}>{l.rate || '-'}</p>
                    <div className="flex-1 text-r pr-1 flex-align-center flex-jsc-end">
                      <svg
                        className="w-4 h-4 red mr-1"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M442.514286 73.142857c82.529524 64.24381 140.239238 126.610286 173.129143 187.099429 31.158857 57.295238 43.666286 115.907048 37.546666 175.835428l-1.219047 9.996191 6.095238-4.973715a174.055619 174.055619 0 0 0 49.249524-69.607619l2.681904-7.411809 7.704381-23.04c82.285714 55.734857 123.440762 150.064762 123.440762 283.062857C841.142857 823.515429 665.795048 950.857143 521.654857 950.857143c-144.11581 0-308.224-85.333333-334.750476-263.875048-26.550857-178.541714 83.480381-261.90019 158.427429-378.197333C395.288381 231.253333 427.690667 152.697905 442.514286 73.142857z m33.718857 154.575238c-17.554286 41.447619-39.424 82.407619-65.536 122.904381l-8.313905 12.653714c-8.411429 12.507429-17.310476 24.941714-28.818286 40.374858l-40.96 54.467047c-63.634286 86.869333-80.944762 136.021333-68.851809 217.526857 17.92 120.441905 128.341333 197.778286 257.901714 197.778286 120.905143 0 241.785905-110.933333 241.785905-249.344 0-61.976381-9.825524-111.323429-29.110857-149.699048-8.240762 9.411048-17.237333 18.285714-26.965334 26.59962l-159.085714 130.023619 26.697143-195.364572c6.41219-46.811429-2.462476-92.208762-27.648-138.483809-13.214476-24.30781-31.98781-49.737143-56.368762-76.166096l-8.338286-8.850285-6.387809 15.579428z"
                          fill="currentColor"
                        ></path>
                      </svg>
                      <p>{l.hot || ''}</p>
                    </div>
                  </>
                )}

                {props.type === 2 && <p className="flex-1 text-r pr-2">{l.score || '-'}</p>}

                {props.type === 3 && (
                  <>
                    <p className="flex-1 text-r pr-2">{l.num || '-'}</p>
                    <p className="flex-1 text-r pr-2">{l.totalNum || '-'}</p>
                  </>
                )}
                {props.type === 4 && (
                  <>
                    <p className="flex-1 text-r pr-2">{l.lastPx || '-'}</p>
                    <p className={`flex-1 text-r pr-2 font-bold ${getRateClassName(l.pxChangeRate || '-')}`}>
                      {l.pxChangeRate || '-'}
                    </p>
                    <p className="flex-1 flex-jsc-end pr-2">
                      <svg
                        className="w-4 h-4 color-svg"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => props.onAddSelection?.(l || {})}
                      >
                        <path
                          d="M953.37931 512C953.37931 268.232939 755.767084 70.62069 512 70.62069 268.232934 70.62069 70.62069 268.232939 70.62069 512 70.62069 755.767061 268.232934 953.37931 512 953.37931 755.767084 953.37931 953.37931 755.767061 953.37931 512ZM547.310345 476.689655 547.310345 264.858364C547.310345 245.21731 531.501374 229.517241 512 229.517241 492.362681 229.517241 476.689655 245.340001 476.689655 264.858364L476.689655 476.689655 264.858359 476.689655C245.217315 476.689655 229.517241 492.498635 229.517241 512 229.517241 531.637326 245.340001 547.310345 264.858359 547.310345L476.689655 547.310345 476.689655 759.141636C476.689655 778.78269 492.498626 794.482759 512 794.482759 531.637319 794.482759 547.310345 778.659999 547.310345 759.141636L547.310345 547.310345 759.141694 547.310345C778.78272 547.310345 794.482759 531.501365 794.482759 512 794.482759 492.362674 778.660017 476.689655 759.141694 476.689655L547.310345 476.689655ZM0 512C0 229.230209 229.230204 0 512 0 794.769832 0 1024 229.230209 1024 512 1024 794.769791 794.769832 1024 512 1024 229.230204 1024 0 794.769791 0 512Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return render()
}

export default observer(TwoTemplateRank)
