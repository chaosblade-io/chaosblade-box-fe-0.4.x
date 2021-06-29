import React, {useEffect, useState} from "react";
import Table from '@alicloud/console-components-table'
import _ from "lodash";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from '@alicloud/console-components-confirm'
import {banMachine, getMachinesForHost, unbanMachine} from "@/services/device";

const HostList = () => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)

  const getMachines = (params?: any) => {
    setVisible(true)
    getMachinesForHost(params).then((data) => {
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
      search={{
        placeholder: '请输入name进行搜索',
        onSearch: ((value: string, filterValue?: any) => {
          getMachines({
            "hostname": value,
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
      <Table.Column title={"主机名称"} dataIndex={"hostname"}/>
      <Table.Column title={"IP 地址"} dataIndex={"ip"}/>
      <Table.Column title={"状态"} dataIndex={"status"} cell={(value: any) => {
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
      <Table.Column title={"是否演练过"} dataIndex={"chaosed"} cell={(value: any) => {
        return value ? "是" : '否'
      }}/>
      <Table.Column title={"最后演练时间"} dataIndex={"chaosTime"}/>
      <Table.Column title={"操作"} cell={(value: any, index: number, record: any) => {
        if (record.status === 9) {
          return <Actions>
            <LinkButton Component={"a"}
                        onClick={() => {
                          setVisible(true)
                          unbanMachine(record.machineId).then(() => {
                            getMachines()
                          }).finally(() => {
                            setVisible(false)
                          })
                        }}>
              启用
            </LinkButton>
          </Actions>
        } else {
          return <Actions>
            <LinkButton Component={"a"}
                        onClick={() => {
                          showConfirmDialog({
                            title: '禁用主机',
                            content: <p>确认要禁用机器吗？禁用后不能用于演练。</p>,
                            onConfirm: () => {
                              setVisible(true)
                              banMachine(record.machineId).then(() => {
                                getMachines()
                              }).finally(() => {
                                setVisible(false)
                              })
                            }
                          })
                        }}>
              禁用
            </LinkButton>
          </Actions>
        }
      }}/>
    </Table>
  </div>
}

export default HostList
