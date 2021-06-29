import {Button, Icon, Message} from "@alicloud/console-components";
import React, {ReactNode, useEffect, useState} from "react";
import Table from '@alicloud/console-components-table'
import {Link} from "react-router-dom";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from "@alicloud/console-components-confirm";
import {banProbe, deleteProbe, getProbesPageable, unbanProbe, uninstallProbe} from "@/services/probe";

const ProbeList = () => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)

  const getProbes = (params?: any) => {
    setVisible(true)
    getProbesPageable({...params, agentType: 0}).then((data) => {
      setDataSource(data.data)
      setTotal(Number(data.total))
      setPage(data.page)
      setPageSize(data.pageSize)
    }).finally(() => {
      setVisible(false)
    })
  }

  useEffect(() => {
    getProbes()
  }, [])

  return <div style={{marginTop: '16px'}}>
    <Table
      loading={visible}
      dataSource={dataSource}
      primaryKey="id"
      operation={<Link to='/probe/install'><Button type="primary">安装探针</Button></Link>}
      search={{
        placeholder: '请输入name进行搜索',
        filter: [
          {
            value: '2',
            label: '在线',
          },
          {
            value: '3',
            label: '离线',
          },
        ],
        onSearch: ((value: string, filterValue?: any) => {
          getProbes({
            "pod": value,
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
          getProbes({
            "page": 1,
            "pageSize": pageSize
          })
        },
        onChange: (current: number, e: Object) => {
          getProbes({
            "page": current,
            "pageSize": pageSize
          })
        },
      }}
    >
      <Table.Column title={"探针 ID"} dataIndex={"probeId"}/>
      <Table.Column title={"设备名称"} dataIndex={"hostname"}/>
      <Table.Column title={"IP"} dataIndex={"ip"}/>
      <Table.Column title={"状态"} dataIndex={"status"} cell={
        (value: number, rowIndex: number, record: any, context: any) => {
          return status(value, record)
        }}/>
      <Table.Column title={"版本"} dataIndex={"version"}/>
      <Table.Column title={"探针类型"} dataIndex={"agentType"} cell={(value: any) => {
        if (value === 0) {
          return '主机'
        }
        return '-'
      }}/>
      <Table.Column title={"心跳时间"} dataIndex={"heartbeatTime"}/>
      <Table.Column title={"操作"} cell={
        (value: string, rowIndex: number, record: any, context: any) => {
          const {status} = record
          let buttons: Array<ReactNode> = []
          if (status === 0 || status === -1) {
            buttons.push(<DeleteButton setVisible={setVisible} getProbes={getProbes} record={record}/>)
          } else {
            //buttons.push(<UninstallButton setVisible={setVisible} getProbes={getProbes} record={record}/>)
            if (status === 2 || status == 3) {
              buttons.push(<BanButton setVisible={setVisible} getProbes={getProbes} record={record}/>)
            } else if (status === 9) {
              buttons.push(<UnbanButton setVisible={setVisible} getProbes={getProbes} record={record}/>)
            }
          }
          return <Actions>
            {buttons.map((item) => {
              return item;
            })}
          </Actions>
        }
      }/>

    </Table>
  </div>
}

const DeleteButton = (props: any) => {
  const {setVisible, record, getProbes} = props
  return <LinkButton Component={"a"}
                     onClick={() => {
                       setVisible(true)
                       deleteProbe({probeId: record.probeId})
                         .then(() => {
                           Message.success("删除成功")
                         }).finally(() => {
                         getProbes()
                       })
                     }}>
    删除
  </LinkButton>
}

const BanButton = (props: any) => {
  const {setVisible, record, getProbes} = props
  return <LinkButton Component={"a"}
                     onClick={() => {
                       setVisible(true)
                       banProbe({probeId: record.probeId})
                         .then(() => {
                           Message.success("禁用成功")
                         }).finally(() => {
                         getProbes()
                       })
                     }}>
    禁用
  </LinkButton>
}

const UnbanButton = (props: any) => {
  const {setVisible, record, getProbes} = props
  return <LinkButton Component={"a"}
                     onClick={() => {
                       setVisible(true)
                       unbanProbe({probeId: record.probeId})
                         .then(() => {
                           Message.success("启用成功")
                         }).finally(() => {
                         getProbes()
                       })
                     }}>
    启用
  </LinkButton>
}

const UninstallButton = (props: any) => {

  const {setVisible, record, getProbes} = props
  const {} = getProbes
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
                             getProbes()
                           })
                         },
                       })
                     }}>
    卸载
  </LinkButton>
}


export const status = (value: number, record: any) => {
  switch (value) {
    case -1:
      return <LinkButton Component={"a"}
                         onClick={() => {
                           showConfirmDialog({
                             title: '详情',
                             content: <p>{record.error}</p>,
                           })
                         }}>
        安装失败
      </LinkButton>
    case 0:
      return '未安装'
    case 1:
      return <Icon size={"xs"} type="loading"> 安装中 </Icon>
    case 2:
      return '在线'
    case 3:
      return '离线'
    case 4:
      return <Icon size={"xs"} type="loading"> 卸载中 </Icon>
    case 5:
      return <LinkButton Component={"a"}
                         onClick={() => {
                           showConfirmDialog({
                             title: '详情',
                             content: <p>{record.error}</p>,
                           })
                         }}> 卸载失败
      </LinkButton>
    case 9:
      return '禁用'
  }
  return '-'
}

ProbeList.title = 'menu.machine.probe'
ProbeList.crumb = [{name: 'menu.machine.probe'}]

export default ProbeList
