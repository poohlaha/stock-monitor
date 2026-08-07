/**
 * @fileOverview 成交量柱状图
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { memo, ReactElement } from 'react'
import { IShareVolumeProps } from '../../types/share'

const Volume: React.FC<IShareVolumeProps> = memo((props: IShareVolumeProps): ReactElement => {
  const render = () => {
    // width * 0.8, 给每根柱子留点间隙
    return (
      <rect
        className={`${props.prefixClassName || ''}-volume-rect`}
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        fill={props.color}
      />
    )
  }

  return render()
})

export default Volume
