import {Button, Dialog, Form, Input, Loading, Message} from "@alicloud/console-components";
import React, {ReactNode, useEffect, useState} from "react";
import Table from '@alicloud/console-components-table'
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {banProbe, getProbesPageable, installProbe, unbanProbe, uninstallProbe} from "@/services/probe";
import _ from 'lodash'
import {status} from "@/pages/probe";

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
}

export interface DialogModel {
  visible: boolean
  loading: boolean
  probeId?: string
  title?: string
  ip?: string,
  port?: number,
  username?: number,
  password?: string
  commandOptions?: string,
  onOk?: (dialogModel: DialogModel) => void
}

export const DialogInstallProbeBySSH = (props: any) => {

  const {dialogModel, setDialogModel} = props
  const {visible, loading, probeId, title, onOk} = dialogModel

  return <Loading visible={loading} fullScreen>
    <Dialog title={title}
            isFullScreen={true}
            visible={visible}
            onOk={() => {
              onOk(dialogModel)
            }}
            onCancel={() => {
              setDialogModel({...dialogModel, visible: false, loading: false})
            }}
            onClose={() => {
              setDialogModel({...dialogModel, visible: false, loading: false})
            }}>
      <Form style={{width: 550}} {...formItemLayout}>
        {
          probeId ? <></> : <FormItem required label="IP:">
            <Input placeholder="ip" name="ip" onChange={(val) => {
              setDialogModel({...dialogModel, ip: val})
            }}/>
          </FormItem>
        }
        <FormItem required label="端口:">
          <Input placeholder="port" name="port" onChange={(val) => {
            setDialogModel({...dialogModel, port: val})
          }}/>
        </FormItem>
        <FormItem required label="用户名:">
          <Input placeholder="username" name="username" onChange={(val) => {
            setDialogModel({...dialogModel, username: val})
          }}/>
        </FormItem>
        <FormItem required label="密码:">
          <Input placeholder="password" name="password" htmlType='password' onChange={(val) => {
            setDialogModel({...dialogModel, password: val})
          }}/>
        </FormItem>
        <FormItem label="配置:">
          <Input placeholder="commandOptions" name="commandOptions" onChange={(val) => {
            setDialogModel({...dialogModel, commandOptions: val})
          }}/>
        </FormItem>
      </Form>
    </Dialog>
  </Loading>
}

const ProbeSSHList = () => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)
  const [dialogModel, setDialogModel] = useState<DialogModel>({
    visible: false,
    loading: false,
  })

  const getProbes = (params?: any) => {
    setVisible(true)
    getProbesPageable({...params, agentType: 0, installMode: 1}).then((data) => {
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
    <DialogInstallProbeBySSH dialogModel={dialogModel} setDialogModel={setDialogModel}/>
    <Table
      loading={visible}
      dataSource={dataSource}
      primaryKey="id"
      operation={<Button type="primary" onClick={() => {
        setDialogModel({
          visible: true,
          loading: false,
          probeId: undefined,
          title: '安装探针',
          onOk: (dialogModel: DialogModel) => {
            if (_.isEmpty(dialogModel.ip)) {
              Message.error("请填写IP")
              return;
            }
            if (_.isEmpty(dialogModel.port)) {
              Message.error("请填写端口")
              return;
            }
            if (_.isEmpty(dialogModel.username)) {
              Message.error("请填写用户名")
              return;
            }
            if (_.isEmpty(dialogModel.password)) {
              Message.error("请填写密码")
              return;
            }
            setDialogModel({...dialogModel, loading: true})
            installProbe({
              host: dialogModel.ip,
              port: dialogModel.port,
              username: dialogModel.username,
              password: dialogModel.password,
              commandOptions: dialogModel.commandOptions,
              installMode: 1,
            }).then(() => {
              Message.success("安装成功")
              setDialogModel({...dialogModel, visible: false})
            }).finally(() => {
              setDialogModel({...dialogModel, loading: false})
            })
          }
        })
      }}>安装探针</Button>}
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
      <Table.Column title={"操作"} cell={(value: string, rowIndex: number, record: any, context: any) => {
        const {status} = record
        let buttons: Array<ReactNode> = []
        if (status === 0 || status === -1) {
          buttons.push(<InstallButton setDialogModel={setDialogModel} dialogModel={dialogModel} getProbes={getProbes}
                                      record={record}/>)
        } else {
          buttons.push(<UninstallButton setDialogModel={setDialogModel} dialogModel={dialogModel}
                                        getProbes={getProbes} record={record}/>)
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
      }}/>

    </Table>
  </div>
}

const BanButton = (props: any) => {
  const {setVisible, getProbes, record} = props
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
  const {setVisible, getProbes, record} = props
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

const InstallButton = (props: any) => {
  const {getProbes, record, setDialogModel} = props

  return <LinkButton Component={"a"}
                     onClick={() => {
                       setDialogModel({
                         visible: true,
                         loading: false,
                         ip: record.ip,
                         probeId: record.probeId,
                         title: '安装探针',
                         onOk: (dialogModel: DialogModel) => {
                           if (_.isEmpty(dialogModel.port)) {
                             Message.error("请填写端口")
                             return;
                           }
                           if (_.isEmpty(dialogModel.username)) {
                             Message.error("请填写用户名")
                             return;
                           }
                           if (_.isEmpty(dialogModel.password)) {
                             Message.error("请填写密码")
                             return;
                           }
                           setDialogModel({...dialogModel, loading: true})
                           installProbe({
                             probeId: record.probeId,
                             host: dialogModel.ip,
                             port: dialogModel.port,
                             username: dialogModel.username,
                             password: dialogModel.password,
                             commandOptions: dialogModel.commandOptions,
                             installMode: 1,
                           }).then(() => {
                             Message.success("安装成功")
                           }).finally(() => {
                             setDialogModel({...dialogModel, visible: false, loading: false})
                             getProbes()
                           })
                         }
                       })
                     }}>
    安装
  </LinkButton>
}

const UninstallButton = (props: any) => {

  const {record, setDialogModel, dialogModel, getProbes} = props

  return <LinkButton Component={"a"}
                     onClick={() => {
                       setDialogModel({
                         ...dialogModel,
                         ip: record.ip,
                         probeId: record.probeId,
                         title: '卸载探针',
                         visible: true,
                         onOk: (dialogModel: DialogModel) => {
                           if (_.isEmpty(dialogModel.port)) {
                             Message.error("请填写端口")
                             return;
                           }
                           if (_.isEmpty(dialogModel.username)) {
                             Message.error("请填写用户名")
                             return;
                           }
                           if (_.isEmpty(dialogModel.password)) {
                             Message.error("请填写密码")
                             return;
                           }
                           setDialogModel({...dialogModel, loading: true})
                           uninstallProbe({
                             probeId: record.probeId,
                             host: dialogModel.ip,
                             port: dialogModel.port,
                             username: dialogModel.username,
                             password: dialogModel.password,
                             commandOptions: dialogModel.commandOptions,
                           }).then(() => {
                             Message.success("卸载成功")
                           }).finally(() => {
                             setDialogModel({...dialogModel, visible: false, loading: false})
                             getProbes()
                           })
                         }
                       })
                     }}>
    卸载
  </LinkButton>
}

export default ProbeSSHList
