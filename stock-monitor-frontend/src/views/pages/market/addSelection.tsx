/**
 * @fileOverview 添加到 自选
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Modal, Select } from 'antd'
import { useStore } from '@views/stores'
import { TOAST } from '@utils/base'

interface IAddSelectionModalProps {
  name: string
  code: string
  market: string
  exchange: string
  type: string
  open: boolean
  onOk: () => void
  onCancel: () => void
}

const AddSelectionModal = (props: IAddSelectionModalProps): ReactElement => {
  const { marketStore } = useStore()
  const [ids, setIds] = useState([])

  const render = () => {
    return (
      <Modal
        title="添加分组"
        mask={{
          closable: false
        }}
        open={props.open}
        onOk={async () => {
          if (ids.length === 0) {
            TOAST.show({ message: '请选择分组', type: 4 })
            return
          }

          await marketStore.onAddToMyWatchlist(
            {
              NAME: props.name || '',
              CODE: props.code || '',
              market: props.market || '',
              exchange: props.exchange || '',
              type: props.type || ''
            },
            () => {
              setIds([])
              props.onOk?.()
            },
            ids || []
          )
        }}
        onCancel={() => {
          setIds([])
          props.onCancel?.()
        }}
      >
        <div className="modal-body flex-direction-column">
          <div className="form-item mt-4 flex-align-center">
            <div className="label mr-4 flex-align-center">
              <p className="whitespace-nowrap">分组</p>
              <span className="flex-center red ml-0.5">*</span>
            </div>

            <Select
              mode="multiple"
              className="flex-1"
              rootClassName="m-ant-select"
              placeholder="请选择"
              allowClear
              optionFilterProp="label"
              showSearch
              maxTagCount={2}
              options={marketStore.watchGroupList || []}
              value={ids || undefined}
              onChange={values => {
                console.log('change values', values)
                setIds(values)
              }}
            />
          </div>
        </div>
      </Modal>
    )
  }

  return render()
}

export default observer(AddSelectionModal)
