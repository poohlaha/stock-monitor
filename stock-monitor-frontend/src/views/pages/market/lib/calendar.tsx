/**
 * @fileOverview 财经日历
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import GroupTemplate from '@views/components/group/one'

const MarketFinancialCalendar = (): ReactElement => {
  const { marketStore } = useStore()

  const getStar = (star: string = '0') => {
    const num = Number(star || '0')
    const getStarSvg = (className: string = '', index: number) => {
      return (
        <svg
          key={index}
          className={`w-3 h-3 ${className || ''}`}
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M781.186088 616.031873q17.338645 80.573705 30.59761 145.848606 6.119522 27.537849 11.219124 55.075697t9.689243 49.976096 7.649402 38.247012 4.079681 19.888446q3.059761 20.398406-9.179283 27.027888t-27.537849 6.629482q-5.099602 0-14.788845-3.569721t-14.788845-5.609562l-266.199203-155.027888q-72.414343 42.836653-131.569721 76.494024-25.498008 14.278884-50.486056 28.557769t-45.386454 26.517928-35.187251 20.398406-19.888446 10.199203q-10.199203 5.099602-20.908367 3.569721t-19.378486-7.649402-12.749004-14.788845-2.039841-17.848606q1.01992-4.079681 5.099602-19.888446t9.179283-37.737052 11.729084-48.446215 13.768924-54.055777q15.298805-63.23506 34.677291-142.788845-60.175299-52.015936-108.111554-92.812749-20.398406-17.338645-40.286853-34.167331t-35.697211-30.59761-26.007968-22.438247-11.219124-9.689243q-12.239044-11.219124-20.908367-24.988048t-6.629482-28.047809 11.219124-22.438247 20.398406-10.199203l315.155378-28.557769 117.290837-273.338645q6.119522-16.318725 17.338645-28.047809t30.59761-11.729084q10.199203 0 17.848606 4.589641t12.749004 10.709163 8.669323 12.239044 5.609562 10.199203l114.231076 273.338645 315.155378 29.577689q20.398406 5.099602 28.557769 12.239044t8.159363 22.438247q0 14.278884-8.669323 24.988048t-21.928287 26.007968z"
            fill="currentColor"
          ></path>
        </svg>
      )
    }

    const arr = []
    for (let i = 1; i <= 3; i++) {
      if (i <= num) {
        arr.push(getStarSvg('red', i))
      } else {
        arr.push(getStarSvg('color-gray-light', i))
      }
    }

    return arr
  }

  const render = () => {
    return (
      <GroupTemplate title="财经日历" className="mt-8">
        <div className="grid grid-cols-2 gap-5">
          {(marketStore.financialCalendarList || []).length === 0 && (
            <div className="flex-center w100 h-[300px] min-h-[300px] color-gray">
              <p>暂无数据</p>
            </div>
          )}

          {(marketStore.financialCalendarList || []).length > 0 &&
            marketStore.financialCalendarList.map((item: Record<string, any> = {}, index: number) => {
              return (
                <div className="flex-direction-column w100 bg-line-hover hover:rounded-md p-2" key={index}>
                  <div className="flex-align-center text-xs">
                    <p>{item.date || ''}</p>
                    <p className="ml-1">{item.time || ''}</p>
                    <p className="ml-2 tag pt-0.5 pb-0.5 pl-1 pr-1">经济数据</p>
                    <div className="ml-2 flex-align-center">{getStar(item.star || '0')}</div>
                  </div>

                  <div className="mt-2 flex-align-center">
                    <img src={item.countryIcon || null} className="w-6 h-6 border rounded-full mr=2" />
                    <p className="text-base font-bold">{item.title || ''}</p>
                  </div>

                  <div className="mt-2 flex-align-center text-xs w100">
                    <div className="flex-1 flex-align-center">
                      <p className="font-bold">前值:</p>
                      <p className="font-bold">{item.formerVal || '--'}</p>
                    </div>
                    <div className="flex-1 flex-align-center">
                      <p className="font-bold">预测:</p>
                      <p className="font-bold">{item.indicateVal || '--'}</p>
                    </div>
                    <div className="flex-1 flex-align-center">
                      <p className="font-bold">公布:</p>
                      <p className="font-bold">{item.pubVal || '--'}</p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </GroupTemplate>
    )
  }

  return render()
}

export default observer(MarketFinancialCalendar)
