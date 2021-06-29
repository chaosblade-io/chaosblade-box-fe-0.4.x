import React, {useEffect, useState} from "react";
import url from "url";
import Table from "@alicloud/console-components-table";
import {Loading} from "@alicloud/console-components";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from "@alicloud/console-components-confirm";
import {deployChaostoolsToHost, getChaostoolsPageable, undeployChaostoolsForHost} from "@/services/tools";

const ToolsHostList = () => {

  const query = url.parse(window.location.search, true).query
  const {name, version} = query

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)

  const getTools = (params?: any) => {
    setVisible(true)
    params = {...params, deviceType: 0, name: name}
    getChaostoolsPageable(params).then((data: any) => {
      setDataSource(data.data)
      setTotal(Number(data.total))
      setPage(data.page)
      setPageSize(data.pageSize)
    }).finally(() => {
      setVisible(false)
    })
  }

  useEffect(() => {
    getTools()
  }, [])

  return <div style={{marginTop: '16px'}}>
    <Loading visible={loading} fullScreen={true}>
      <Table
        loading={visible}
        dataSource={dataSource}
        search={{
          placeholder: '请输入 name 进行搜索',
          filter: [
            {
              value: '0',
              label: '未安装',
            },
            {
              value: '1',
              label: '已安装',
            },
          ],
          onSearch: ((value: string, filterValue?: any) => {
            getTools({
              "hostname": value,
              "status": filterValue
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
            getTools({
              "page": 1,
              "pageSize": pageSize
            })
          },
          onChange: (current: number, e: Object) => {
            getTools({
              "page": current,
              "pageSize": pageSize
            })
          },
        }}
      >

        <Table.Column title={"主机名称"} dataIndex={"hostname"}/>
        <Table.Column title={"IP 地址"} dataIndex={"ip"}/>
        <Table.Column title={"工具名称"} dataIndex={"name"}/>
        <Table.Column title={"工具版本"} dataIndex={"version"}/>
        <Table.Column title={"状态"} dataIndex={"status"} cell={(value: number) => {
          if (value) {
            return '已安装'
          }
          return '未安装'
        }}/>

        <Table.Column title={"操作"} cell={(value: any, index: number, record: any) => {
          const {status} = record
          if (status === 0) {
            return <Actions>
              <LinkButton Component={"a"}
                          onClick={() => {
                            showConfirmDialog({
                              type: 'notice',
                              title: '安装工具',
                              content: <p>确认要安装 {name} 工具吗？</p>,
                              onConfirm: () => {
                                setLoading(true)
                                deployChaostoolsToHost({
                                  machineId: record.deviceId,
                                  name: name,
                                  version: version
                                }).finally(() => {
                                  setLoading(false)
                                  getTools()
                                })
                              }
                            })
                          }}>
                安装
              </LinkButton>
            </Actions>
          } else {
            return <Actions>
              <LinkButton Component={"a"}
                          onClick={() => {
                            showConfirmDialog({
                              type: 'warning',
                              title: '卸载工具',
                              content: <p>`确认要卸载 {name} 工具吗？`</p>,
                              onConfirm: () => {
                                setLoading(true)
                                undeployChaostoolsForHost({
                                  machineId: record.deviceId,
                                  name: name,
                                  version: version
                                }).finally(() => {
                                  setLoading(false)
                                  getTools()
                                })
                              }
                            })
                          }}>
                卸载
              </LinkButton>
            </Actions>
          }
        }}/>
      </Table>
    </Loading>
  </div>
}

export default ToolsHostList;
