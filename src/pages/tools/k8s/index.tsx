import React, {useEffect, useState} from "react";
import url from "url";
import Table from "@alicloud/console-components-table";
import {Dialog, Loading, Message} from "@alicloud/console-components";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from "@alicloud/console-components-confirm";
import {
  getChaostoolsPageable,
  getHelmValueYaml,
  undeployChaostoolsToK8S,
  deployChaostoolsToK8S
} from "@/services/tools";
import {UnControlled as CodeMirror} from "react-codemirror2";

const ToolsHostList = () => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)
  const [dialogVisible, setDialogVisible] = useState<boolean>(false)
  const [machineId, setMachineId] = useState<string>()

  const name: string = url.parse(window.location.search, true).query.name as string;
  const version: string = url.parse(window.location.search, true).query.version as string;

  const getTools = (params?: any) => {
    setVisible(true)
    params = {...params, deviceType: 9, name: name}
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
          placeholder: '请输入name进行搜索',
          filter: [
            {
              value: '1',
              label: '已安装',
            },
            {
              value: '0',
              label: '未安装',
            },
          ],
          onSearch: ((value: string, filterValue?: any) => {
            getTools({
              "clusterName": value,
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

        <Table.Column title={"集群名称"} dataIndex={"clusterName"}/>
        <Table.Column title={"工具名称"} dataIndex={"name"}/>
        <Table.Column title={"工具版本"} dataIndex={"version"}/>
        <Table.Column title={"状态"} dataIndex={"status"} cell={(value: any) => {
          if (value) {
            return '已安装'
          }
          return '未安装'
        }}/>
        <Loading visible={loading} fullScreen={true}/>
        <Table.Column title={"操作"} cell={(value: any, index: number, record: any) => {
          const {status, deviceId} = record
          if (status === 0) {
            return <Actions>
              <LinkButton Component={"a"}
                          onClick={() => {
                            setMachineId(deviceId)
                            setDialogVisible(true)
                          }}>
                Helm 安装
              </LinkButton>
            </Actions>
          } else {
            return <Actions>
              <LinkButton Component={"a"}
                          onClick={() => {
                            showConfirmDialog({
                              type: 'warning',
                              title: '卸载工具',
                              content: <p>确认要卸载 {name} 工具机器吗？</p>,
                              onConfirm: () => {
                                setLoading(true)
                                undeployChaostoolsToK8S({
                                  machineId: deviceId,
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
    <Helm dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          name={name}
          version={version}
          machineId={machineId}
          getTools={getTools}
    />
  </div>
}

const Helm = (props: any) => {

  const {dialogVisible, setDialogVisible, name, version, machineId, getTools} = props

  const [data, setData] = useState<string>()
  const [visible, setVisible] = useState<boolean>(false)
  const [helmValues, setHelmValues] = useState<string>()

  useEffect(() => {
    getHelmValueYaml({name: name, version: version}).then((data) => {
      setData(data)
      setHelmValues(data)
    })
  })

  return <Loading visible={visible} fullScreen={true}>
    <Dialog title="请更新参数" visible={dialogVisible} style={{width: 800}}
            onClose={() => {
              setDialogVisible(false)
            }}
            onCancel={() => {
              setDialogVisible(false)
            }}
            onOk={() => {
              setVisible(true)
              deployChaostoolsToK8S({
                machineId: machineId,
                helmValues: helmValues,
                name: name,
                version: version
              }).then((data) => {
                Message.notice(data)
              }).finally(() => {
                setVisible(false)
                getTools()
              })
              setDialogVisible(false)
            }}
    >
      <CodeMirror
        value={data}
        options={{
          mode: 'yaml',
          theme: 'material-darker',
          lineNumbers: true
        }}
        onChange={(editor, data, value) => {
          setHelmValues(value)
        }}
      />
    </Dialog>
  </Loading>
}

export default ToolsHostList;
