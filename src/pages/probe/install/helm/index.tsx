import {Button, Dialog, Form, Input, Loading, Message} from "@alicloud/console-components";
import React, {useEffect, useState} from "react";
import Table from '@alicloud/console-components-table'
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from "@alicloud/console-components-confirm";
import 'codemirror/lib/codemirror.js'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/mode/yaml/yaml';
import {activeCollect, addCluster, closeCollect, getClusterPageable, updateCluster} from "@/services/cluster";
import _ from "lodash";

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
}

interface DialogField {
  title: string
  visible: boolean,
  clusterId?: string,
  clusterName?: string,
  config?: string,
  getCluster: (params?: any) => void
}


const DialogAddCluster = (props: any) => {

  const {dialogModel, updateDialogModel} = props
  const {title, visible, clusterId, clusterName, config, getCluster} = dialogModel;

  const [loading, setLoading] = useState<boolean>(false)

  return <Loading visible={loading} fullScreen>
    <Dialog title={title}
            isFullScreen={true}
            visible={visible}
            onOk={() => {
              if (_.isEmpty(clusterName)) {
                Message.error("请填写集群名称")
                return
              }

              if (_.isEmpty(clusterName)) {
                Message.error("请填写 Kubeconfig")
                return
              }

              setLoading(true)
              if (clusterId) {

                updateCluster({id: clusterId, clusterName: clusterName, config: config}).then(() => {
                  Message.success("修改成功")
                  updateDialogModel({...dialogModel, visible: false})
                  getCluster()
                }).finally(() => {
                  setLoading(false)
                })
              } else {
                addCluster({clusterName: clusterName, config: config}).then(() => {
                  Message.success("添加成功")
                  updateDialogModel({...dialogModel, visible: false})
                  getCluster()
                }).finally(() => {
                  setLoading(false)
                })
              }
            }}
            onCancel={() => {
              updateDialogModel({...dialogModel, visible: false})
            }}
            onClose={() => {
              updateDialogModel({...dialogModel, visible: false})
            }}>
      <Form style={{width: 550}} {...formItemLayout}>
        <FormItem required label="集群名称:">
          <Input placeholder="hostname" name="hostname" defaultValue={clusterName} onChange={(val) => {
            updateDialogModel({...dialogModel, clusterName: val})
          }}/>
        </FormItem>
        <FormItem required label="Kubeconfig:">
          <Input.TextArea placeholder="Config" name="config" defaultValue={config} onChange={(val) => {
            updateDialogModel({...dialogModel, config: val})
          }}/>
        </FormItem>
      </Form>
    </Dialog>
  </Loading>
}

const ProbeK8SList = () => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)

  const getCluster = (params?: any) => {
    setVisible(true)
    params = {...params, agentType: 1}
    getClusterPageable(params).then((data: any) => {
      setDataSource(data.data)
      setTotal(Number(data.total))
      setPage(data.page)
      setPageSize(data.pageSize)
    }).finally(() => {
      setVisible(false)
    })
  }

  const [dialogModel, updateDialogModel] = useState<DialogField>({
    title: '添加集群',
    visible: false,
    getCluster: getCluster
  })

  useEffect(() => {
    getCluster()
  }, [])

  return <div style={{marginTop: '16px'}}>
    <DialogAddCluster updateDialogModel={updateDialogModel} dialogModel={dialogModel}/>
    <Loading visible={visible} fullScreen>
      <Table
        dataSource={dataSource}
        primaryKey="id"
        operation={<Button type="primary" onClick={() => {
          updateDialogModel({...dialogModel, title: '添加集群', visible: true, clusterId: undefined, clusterName: undefined, config: undefined})
        }}>添加集群</Button>}
        search={{
          placeholder: '请输入name进行搜索',
          filter: [
            {
              value: '',
              label: '全部',
            },
            {
              value: 'true',
              label: '开启采集',
            },
            {
              value: 'false',
              label: '未开启采集',
            },
          ],
          defaultFilterValue: '',
          onSearch: ((value: string, filterValue?: any) => {
            getCluster({
              "clusterName": value,
              "isCollector": filterValue
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
            getCluster({
              "page": 1,
              "pageSize": pageSize
            })
          },
          onChange: (current: number, e: Object) => {
            getCluster({
              "page": current,
              "pageSize": pageSize
            })
          },
        }}
      >
        <Table.Column title={"集群ID"} dataIndex={"id"}/>
        <Table.Column title={"集群名称"} dataIndex={"clusterName"}/>
        <Table.Column title={"是否开启采集"} dataIndex={"isCollector"} cell={(value: any) => {
          if (value) {
            return '开启采集'
          } else {
            return '未开启采集'
          }
        }}/>
        <Table.Column title={"最后一次采集时间"} dataIndex={"lastCollectTime"}/>
        <Table.Column title={"操作"} cell={(value: any, index: number, record: any) => {
          const {isCollector, id} = record
          if (isCollector) {
            return <Actions>
              <LinkButton Component={"a"}
                          onClick={() => {
                            showConfirmDialog({
                              title: '关闭集群',
                              content: <p>确认要关闭数据采集吗？</p>,
                              onConfirm: () => {
                                closeCollect({
                                  id: id
                                }).then(() => {
                                  Message.success("关闭成功")
                                  getCluster()
                                })
                              }
                            })
                          }}>
                关闭采集
              </LinkButton>
              <LinkButton Component={"a"}
                          onClick={() => {
                            showConfirmDialog({
                              title: '集群详情',
                              content: <p><Form style={{width: 450}}
                                                labelCol={{span: 6}}
                                                wrapperCol={{span: 14}}>
                                <Form.Item label="集群名称: ">
                                  <p className="next-form-text-align">
                                    {record.clusterName}
                                  </p>
                                </Form.Item>
                                <Form.Item label="Kubeconfig: ">
                                  <p className="next-form-text-align">
                                    {record.config}
                                  </p>
                                </Form.Item>
                              </Form></p>,
                            })
                          }}>
                详情
              </LinkButton>
              <LinkButton Component={"a"}
                          onClick={() => {
                            updateDialogModel({
                              ...dialogModel,
                              title: '编辑集群',
                              visible: true,
                              clusterId: record.id,
                              clusterName: record.clusterName,
                              config: record.config
                            })
                          }}>
                编辑
              </LinkButton>
            </Actions>
          } else {
            return <Actions>
              <LinkButton onClick={() => {
                showConfirmDialog({
                  title: '开启采集',
                  content: <p>确认要开启数据采集吗？</p>,
                  onConfirm: () => {
                    activeCollect({
                      id: id
                    }).then(() => {
                      Message.success("开启成功")
                      getCluster()
                    })
                  }
                })
              }}>
                开启采集
              </LinkButton>
              <LinkButton Component={"a"}
                          onClick={() => {
                            showConfirmDialog({
                              title: '集群详情',
                              content: <p><Form style={{width: 550}}
                                                labelCol={{span: 6}}
                                                wrapperCol={{span: 14}}>
                                <Form.Item label="集群名称: ">
                                  <p className="next-form-text-align">
                                    {record.clusterName}
                                  </p>
                                </Form.Item>
                                <Form.Item label="Kubeconfig: ">
                                  <p className="next-form-text-align">
                                    {record.config}
                                  </p>
                                </Form.Item>
                              </Form></p>,
                            })
                          }}>
                详情
              </LinkButton>
              <LinkButton Component={"a"}
                          onClick={() => {
                            updateDialogModel({
                              ...dialogModel,
                              title: '编辑集群',
                              visible: true,
                              clusterId: record.id,
                              clusterName: record.clusterName,
                              config: record.config
                            })
                          }}>
                编辑
              </LinkButton>
            </Actions>
          }
        }}/>
      </Table>
    </Loading>

  </div>
}

export default ProbeK8SList
