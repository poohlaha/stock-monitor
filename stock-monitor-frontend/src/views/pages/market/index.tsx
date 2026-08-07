/**
 * @fileOverview 市场
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'

const Market = (): ReactElement => {
  const render = () => {
    return <div className="market-page wh100"></div>
  }

  return render()
}

export default observer(Market)
