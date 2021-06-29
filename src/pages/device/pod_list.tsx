import React, {useEffect, useState} from "react";
import Table from '@alicloud/console-components-table'
import _ from "lodash";
import {banMachine, getMachinesForPodPageable, unbanMachine} from "@/services/device";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from "@alicloud/console-components-confirm";

const PodTab = () => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)

  const getMachines = (params?: any) => {
    setVisible(true)
    getMachinesForPodPageable(params).then((data) => {
      setDataSource(data.data)
      setTotal(Number(data.total))
      setPage(data.page)
      setPageSize(data.pageSize)
    }).finally(() => {
      setVisible(false)
    })
  }

  useEffect(() => {
    getMachines()
  }, [])

  return <div style={{marginTop: '16px'}}>
    <Table
      loading={visible}
      dataSource={dataSource}
      primaryKey="id"
      search={{
        placeholder: '请输入name进行搜索',
        onSearch: ((value: string, filterValue?: any) => {
          getMachines({
            "pod": value,
          })
        })
      }}
      pagination={{
        popupProps: {
          align: "bl tl"
        },
        current: page,
        pageSize: pageSize,
        total: total,
        onPageSizeChange: (pageSize: number) => {
          getMachines({
            "page": 1,
            "pageSize": pageSize
          })
        },
        onChange: (current: number, e: Object) => {
          getMachines({
            "page": current,
            "pageSize": pageSize
          })
        },
      }}
    >
      <Table.Column title={'节点名称'} dataIndex={'nodeName'}/>
      <Table.Column title={'命名空间'} dataIndex={'namespace'}/>
      <Table.Column title={'Pod 名称'} dataIndex={'podName'}/>
      <Table.Column title={'状态'} dataIndex={'status'} cell={(value: any) => {
        switch (value) {
          case -1:
            return '安装失败'
          case 0:
            return '未安装'
          case 1:
            return '安装中'
          case 2:
            return '在线'
          case 3:
            return '离线'
          case 4:
            return '卸载中'
          case 5:
            return '卸载失败'
          case 9:
            return '禁用'
        }
        return 0
      }}/>
      <Table.Column title={'是否演练过'} dataIndex={'chaosTime'} cell={(value: any) => {
        return value ? "是" : '否'
      }}/>
      <Table.Column title={'最近演练时间'} dataIndex={'chaosTime'} cell={(value: any) => {
        return _.isEmpty(value) ? "-" : value
      }}/>

      <Table.Column title={"操作"} cell={(value: any, index: number, record: any) => {
        if (record.status === 9) {
          return <Actions>
            <LinkButton Component={"a"}
                        onClick={() => {
                          setVisible(true)
                          unbanMachine(record.machineId).then(() => {
                            getMachines()
                          })
                        }}>
              启用
            </LinkButton>
            <LinkButton Component={"a"} onClick={() => {
              showConfirmDialog({
                title: '容器列表',
                content: <p>
                  <Table dataSource={record.containers}>
                    <Table.Column title="Container ID" dataIndex="containerId"/>
                    <Table.Column title="Container name" dataIndex="containerName"/>
                  </Table>
                </p>,
              })
            }}>
              容器
            </LinkButton>
          </Actions>
        } else {
          return <Actions>
            <LinkButton Component={"a"}
                        onClick={() => {
                          showConfirmDialog({
                            title: '禁用 Pod',
                            content: <p>确认要禁用 Pod 吗？禁用后不能用于演练。</p>,
                            onConfirm: () => {
                              setVisible(true)
                              banMachine(record.machineId).then(() => {
                                getMachines()
                              })
                            }
                          })
                        }}>
              禁用
            </LinkButton>
            <LinkButton Component={"a"} onClick={() => {
              showConfirmDialog({
                title: '容器列表',
                content: <p>
                  <Table dataSource={record.containers} size={'small'} tableWidth={550}>
                    <Table.Column title="Container ID" dataIndex="containerId"/>
                    <Table.Column title="Container name" dataIndex="containerName"/>
                  </Table>
                </p>,
              })
            }}>
              容器
            </LinkButton>
          </Actions>
        }
      }}/>
    </Table>
  </div>
}

export default PodTab
