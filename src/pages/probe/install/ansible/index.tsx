import React, {ReactNode, useEffect, useState} from "react";
import {Badge, Button, Icon, Message} from "@alicloud/console-components";
import Table from "@alicloud/console-components-table";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {TableProps} from "@alicloud/console-components/types/table";
import {
  banProbe,
  getAnsibleHosts,
  installProbe, unbanProbe,
  uninstallProbe
} from "@/services/probe";
import {showConfirmDialog} from "@alicloud/console-components-confirm";
import {status} from "@/pages/probe";

const rowSelection: TableProps['rowSelection'] & {
  UNSTABLE_defaultSelectedRowKeys?: any[]
} = {
  getProps: (item: any, i: number) => {
    return ({disabled: item.status !== 0 && item.status !== -1})
  },
  UNSTABLE_defaultSelectedRowKeys: [],
}

const AnsibleInstall = () => {

  const [visible, setVisible] = useState(false)
  const [dataSource, setDataSource] = useState([])

  useEffect(() => {
    setVisible(true)
    getAnsibleHosts().then(function (data) {
      setDataSource(data)
    }).finally(() => {
      setVisible(false)
    })
  }, [])

  return <div style={{marginTop: '16px'}}>
    <Table
      loading={visible}
      rowSelection={rowSelection}
      dataSource={dataSource}
      primaryKey="id"
      selection={({selectedRowKeys}: { selectedRowKeys: any[] }) => {
        return (
          <Badge count={selectedRowKeys.length}>
            <Button size={"small"} disabled={selectedRowKeys.length === 0}>
              批量安装
            </Button>
          </Badge>
        )
      }}
    >
      <Table.Column title={"IP 地址"} dataIndex={"host"}/>
      <Table.Column title={"机器状态"} dataIndex={"status"} cell={
        (value: number, rowIndex: number, record: any, context: any) => {
          return status(value, record)
        }}/>
      <Table.Column title={"操作"} cell={(value: string, rowIndex: number, record: any, context: any) => {
        const {status} = record
        let buttons: Array<ReactNode> = []
        if (status === 0 || status === -1) {
          buttons.push(<InstallButton setVisible={setVisible} setDataSource={setDataSource} record={record}/>)
        } else if (status === 1) {
          buttons.push(<Icon size={"xs"} type="loading"> 安装中 </Icon>)
        } else {
          buttons.push(<UninstallButton setVisible={setVisible} setDataSource={setDataSource} record={record}/>)
          if (status === 2 || status == 3) {
            buttons.push(<BanButton setVisible={setVisible} setDataSource={setDataSource} record={record}/>)
          } else if (status === 9) {
            buttons.push(<UnbanButton setVisible={setVisible} setDataSource={setDataSource} record={record}/>)
          }
        }
        return <Actions>
          {buttons.map((item) => {
            return item;
          })}
        </Actions>
      }}/>
    </Table>
  </div>
}

const BanButton = (props: any) => {
  const {setVisible, setDataSource, record} = props
  return <LinkButton Component={"a"}
                     onClick={() => {
                       setVisible(true)
                       banProbe({probeId: record.probeId})
                         .then(() => {
                           Message.success("禁用成功")
                         }).finally(() => {
                         getAnsibleHosts().then(function (data) {
                           setDataSource(data)
                         }).finally(() => {
                           setVisible(false)
                         })
                       })
                     }}>
    禁用
  </LinkButton>
}

const UnbanButton = (props: any) => {
  const {setVisible, setDataSource, record} = props
  return <LinkButton Component={"a"}
                     onClick={() => {
                       setVisible(true)
                       unbanProbe({probeId: record.probeId})
                         .then(() => {
                           Message.success("启用成功")
                         }).finally(() => {
                         getAnsibleHosts().then(function (data) {
                           setDataSource(data)
                         }).finally(() => {
                           setVisible(false)
                         })
                       })
                     }}>
    启用
  </LinkButton>
}

const InstallButton = (props: any) => {
  const {setVisible, setDataSource, record} = props

  return <LinkButton Component={"a"}
                     onClick={() => {
                       setVisible(true)
                       installProbe({host: record.host, installMode: 0,})
                         .then(() => {
                           Message.success("安装成功")
                         }).finally(() => {
                         getAnsibleHosts().then(function (data) {
                           setDataSource(data)
                         }).finally(() => {
                           setVisible(false)
                         })
                       })
                     }}>
    安装
  </LinkButton>
}

const UninstallButton = (props: any) => {

  const {setVisible, setDataSource, record} = props

  return <LinkButton Component={"a"}
                     onClick={() => {
                       showConfirmDialog({
                         title: '卸载探针',
                         content: <p>确认要卸载探针吗？</p>,
                         onConfirm: () => {
                           setVisible(true)
                           uninstallProbe({probeId: record.probeId})
                             .then(() => {
                               Message.success("卸载成功")
                             }).finally(() => {
                             getAnsibleHosts().then(function (data) {
                               setDataSource(data)
                             }).finally(() => {
                               setVisible(false)
                             })
                           })
                         },
                       })
                     }}>
    卸载
  </LinkButton>
}


export default AnsibleInstall
