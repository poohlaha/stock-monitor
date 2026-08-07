/**
 * @fileOverview 我的自选列表
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import useMount from '@hooks/useMount'
import RouterUrls from '@route/router.url.toml'
import Page from '@views/modules/page'
import { Pagination, Popconfirm, Space, Table } from 'antd'

const My = (): ReactElement => {
  const { myStore } = useStore()
  const [tableHeight, setTableHeight] = useState(0)

  useMount(async () => {
    setTableHeight(myStore.resize('operation-banner-page'))
    window.addEventListener('resize', () => {
      setTableHeight(myStore.resize('operation-banner-page'))
    })
  })

  let COLUMNS: any = [
    {
      title: '基金名称',
      dataIndex: 'innerAppName',
      key: 'innerAppName',
      width: 180,
      fixed: 'left'
    },
    {
      title: '单位净值',
      dataIndex: 'resourceName',
      key: 'resourceName',
      width: 180,
      fixed: 'left'
    },
    {
      title: '当日涨幅(估算)',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180,
      fixed: 'left'
    },
    {
      title: '基金公司',
      dataIndex: 'innerAppName',
      key: 'innerAppName',
      width: 180
    },
    {
      title: '基金经理',
      dataIndex: 'innerAppName',
      key: 'innerAppName',
      width: 180
    },
    {
      title: '基金规模',
      dataIndex: 'innerAppName',
      key: 'innerAppName',
      width: 180
    },
    {
      title: '累计净值',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180
    },
    {
      title: '近1月',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180
    },
    {
      title: '近3月',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180
    },
    {
      title: '近6月',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180
    },
    {
      title: '近1年',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180
    },
    {
      title: '近3年',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180
    },
    {
      title: '成立以来',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_: any, __: { [K: string]: any } = {}) => {
        return (
          <div className="actions">
            <Space size="middle">
              <p>置顶</p>
              <Popconfirm
                rootClassName="m-ant-popover"
                title={RouterUrls.BACKEND_PERMISSION.ROLE.NAME}
                description="是否删除此项?"
                onConfirm={async () => {}}
                okText="确定"
                cancelText="取消"
              >
                <svg
                  className="w-4 h-4 color-gray"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4996"
                  width="256"
                  height="256"
                >
                  <path
                    d="M254.398526 804.702412l-0.030699-4.787026C254.367827 801.546535 254.380106 803.13573 254.398526 804.702412zM614.190939 259.036661c-22.116717 0-40.047088 17.910928-40.047088 40.047088l0.37146 502.160911c0 22.097274 17.930371 40.048111 40.047088 40.048111s40.048111-17.950837 40.048111-40.048111l-0.350994-502.160911C654.259516 276.948613 636.328122 259.036661 614.190939 259.036661zM893.234259 140.105968l-318.891887 0.148379-0.178055-41.407062c0-22.13616-17.933441-40.048111-40.067554-40.048111-7.294127 0-14.126742 1.958608-20.017916 5.364171-5.894244-3.405563-12.729929-5.364171-20.031219-5.364171-22.115694 0-40.047088 17.911952-40.047088 40.048111l0.188288 41.463344-230.115981 0.106424c-3.228531-0.839111-6.613628-1.287319-10.104125-1.287319-3.502777 0-6.89913 0.452301-10.136871 1.296529l-73.067132 0.033769c-22.115694 0-40.048111 17.950837-40.048111 40.047088 0 22.13616 17.931395 40.048111 40.048111 40.048111l43.176358-0.020466 0.292666 617.902982 0.059352 0 0 42.551118c0 44.233434 35.862789 80.095199 80.095199 80.095199l40.048111 0 0 0.302899 440.523085-0.25685 0-0.046049 40.048111 0c43.663452 0 79.146595-34.95 80.054267-78.395488l-0.329505-583.369468c0-22.135136-17.930371-40.047088-40.048111-40.047088-22.115694 0-40.047088 17.911952-40.047088 40.047088l0.287549 509.324054c-1.407046 60.314691-18.594497 71.367421-79.993892 71.367421l41.575908 1.022283-454.442096 0.26606 52.398394-1.288343c-62.715367 0-79.305207-11.522428-80.0645-75.308173l0.493234 76.611865-0.543376 0-0.313132-660.818397 236.82273-0.109494c1.173732 0.103354 2.360767 0.166799 3.561106 0.166799 1.215688 0 2.416026-0.063445 3.604084-0.169869l32.639375-0.01535c1.25355 0.118704 2.521426 0.185218 3.805676 0.185218 1.299599 0 2.582825-0.067538 3.851725-0.188288l354.913289-0.163729c22.115694 0 40.050158-17.911952 40.050158-40.047088C933.283394 158.01792 915.349953 140.105968 893.234259 140.105968zM774.928806 815.294654l0.036839 65.715701-0.459464 0L774.928806 815.294654zM413.953452 259.036661c-22.116717 0-40.048111 17.910928-40.048111 40.047088l0.37146 502.160911c0 22.097274 17.931395 40.048111 40.049135 40.048111 22.115694 0 40.047088-17.950837 40.047088-40.048111l-0.37146-502.160911C454.00054 276.948613 436.069145 259.036661 413.953452 259.036661z"
                    fill="currentColor"
                  ></path>
                </svg>
              </Popconfirm>
            </Space>
          </div>
        )
      }
    }
  ]

  const render = () => {
    const tableStyle: any = {
      x: 500,
      y: 0
    }

    if (tableHeight > 0) {
      tableStyle.y = tableHeight ?? 0
    }

    return (
      <Page
        className="my-page"
        contentClassName="flex-direction-column"
        title={{
          label: RouterUrls.MY.LIST.NAME || ''
        }}
      >
        <div className="page-content flex-1 flex-direction-column pt-5">
          <div className="page-wrapper w100 flex-1 flex-direction-column">
            {/* table */}
            <Table
              className="m-ant-table flex-1"
              columns={COLUMNS}
              dataSource={myStore.list || []}
              pagination={false}
              scroll={tableStyle}
            />

            {/* pagination */}
            <div className="flex-jsc-end h-20 flex-align-center page-pagination">
              <Pagination
                className="m-ant-pagination"
                showSizeChanger={false}
                total={myStore.total}
                current={myStore.currentPage}
                pageSize={myStore.pageSize}
                pageSizeOptions={myStore.pageSizeOptions}
                showTotal={total => `共 ${total} 条`}
                onChange={async (page: number, pageSize: number) => {
                  myStore.currentPage = myStore.pageSize !== pageSize ? 1 : page
                  myStore.pageSize = pageSize
                  await myStore.getList()
                }}
              />
            </div>
          </div>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(My)
