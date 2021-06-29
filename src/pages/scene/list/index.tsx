import {Button, Upload, Message, Loading} from "@alicloud/console-components";
import React, {useEffect, useState} from "react";
import Table from '@alicloud/console-components-table'
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {banScenario, getScenariosPageable, unbanScenario} from "@/services/scenarios";
import {useHistory} from "react-router-dom";

const SceneList = () => {

  const history = useHistory();

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)

  const getScenarios = (params?: any) => {
    setVisible(true)
    getScenariosPageable({...params, agentType: 0, installMode: 1}).then((data) => {
      setDataSource(data.data)
      setTotal(Number(data.total))
      setPage(data.page)
      setPageSize(data.pageSize)
    }).finally(() => {
      setVisible(false)
    })
  }

  useEffect(() => {
    getScenarios()
  }, [])

  return <div style={{marginTop: '16px'}}>
    <Table
      loading={visible}
      dataSource={dataSource}
      primaryKey=" id"
      operation={<UploadScene/>}
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
          getScenarios({
            " pod": value,
            " status": filterValue
          })
        })
      }}
      pagination={{
        popupProps: {
          align: " bl tl"
        },
        current: page,
        pageSize: pageSize,
        total: total,
        onPageSizeChange: (pageSize: number) => {
          getScenarios({
            "page": 1,
            "pageSize": pageSize
          })
        },
        onChange: (current: number, e: Object) => {
          getScenarios({
            "page": current,
            "pageSize": pageSize
          })
        },
      }}
    >
      <Table.Column dataIndex={'name'} title={'场景名称'}/>
      <Table.Column dataIndex={'code'} title={'唯一码'}/>
      <Table.Column dataIndex={'original'} title={'来源'}/>
      <Table.Column dataIndex={'version'} title={'版本'}/>
      <Table.Column dataIndex={'status'} title={'是否上架'} cell={(value: any) => {
        return value === 1 ? '是' : '否'
      }}/>
      <Table.Column dataIndex={'count'} title={'使用次数'}/>
      <Table.Column title={'操作'} cell={(value: string, rowIndex: number, record: any, context: any) => {
        const {scenarioId, status} = record
        if (status) {
          return (<Actions>
            <LinkButton Component={"a"}
                        onClick={() => {
                          banScenario({"scenarioId": scenarioId}).then(() => {
                            Message.notice("下架成功")
                            getScenarios()
                          })
                        }}>
              下架
            </LinkButton>
            <LinkButton Component={"a"}
                        onClick={() => {
                          history.push(`/scene/detail?id=${scenarioId}`)
                        }}
            >
              详情
            </LinkButton>
          </Actions>)
        } else {
          return (<Actions>
            <LinkButton Component={"a"}
                        onClick={() => {
                          unbanScenario({"scenarioId": scenarioId}).then(() => {
                            Message.notice("上架成功")
                            getScenarios()
                          })
                        }}>
              上架
            </LinkButton>
            <LinkButton Component={"a"}
                        onClick={() => {
                          history.push(`/scene/detail?id=${scenarioId}`)
                        }}
            >
              详情
            </LinkButton>
          </Actions>)
        }

      }}/>

    </Table>
  </div>
}

const UploadScene = () => {

  const [visible, setVisible] = useState<boolean>(false)

  return <Loading visible={visible} fullScreen={true}>
    <Upload
      action="/api/UploadScenarios"
      formatter={(res) => {
        return {
          success: res.success,
          message: res.message
        }
      }}
      beforeUpload={() => {
        setVisible(true)
      }}
      onChange={() => {
      }}
      onError={(file: Object, value) => {
        setVisible(false)
        Message.error(value[0].response.message)
      }}
      onSuccess={(file: Object, value) => {
        setVisible(false)
        Message.success('导入成功')
      }}
      multiple
      name={'scenarios'}
    >
      <Button type="primary">导入场景</Button>
    </Upload>
  </Loading>
}

SceneList.title = 'menu.scenario.list'
SceneList.crumb = [{name: 'menu.scenario.list'}]

export default SceneList
