import React, {useEffect, useState} from 'react'
import '@alicloud/console-components/dist/wind.css'
import DataFields, {IDataFieldsProps} from '@alicloud/console-components-data-fields'
import url from "url";
import {useHistory} from "react-router-dom";
import {getScenarioById} from "@/services/scenarios";
import Table from "@alicloud/console-components-table";
import {Button, Tag} from "@alicloud/console-components";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import {DialogEditScene, EditSceneModel} from "@/pages/scene/detail/scene_edit_dialog";
import {DialogEditSceneParam, EditSceneParamModel} from "@/pages/scene/detail/scene_param_dialog";


const items: IDataFieldsProps['items'] = [
  {
    dataIndex: 'name',
    render: val => <h1>{val}</h1>,
    span: 24,
  },
  {
    dataIndex: 'original',
    label: '来源',
    span: 12,
  },
  {
    dataIndex: 'status',
    label: '状态',
    span: 12,
    render: (val: any) => {
      return val ? '上架' : '下架'
    },
  },
  {
    dataIndex: 'version',
    label: '版本',
    span: 12,
  },
  {
    dataIndex: 'supportScopeTypes',
    label: '支持维度',
    span: 12,
  },
  {
    dataIndex: 'categories',
    label: '所属类目',
    span: 12,
    render: (val: any) => {
      if (val) {
        return val.map((item: any, index:number) => {
          return <Tag key={index} type="normal"> {item.categoryName} </Tag>
        })
      } else {
        return <></>
      }
    },
  }
]

const ScenarioDetail = () => {

  const [data, setDate] = useState<any>({})

  const [editSceneModel, setEditSceneModel] = useState<EditSceneModel>({
    visible: false,
    loading: false,
    categories: [],
    supportScopeTypes: []
  })

  const [editSceneParamModel, setEditSceneParamModel] = useState<EditSceneParamModel>({
    visible: false,
    loading: false,
  })

  const history = useHistory();
  const query = url.parse(history.location.search, true).query
  const {id} = query

  useEffect(() => {
    getScenarioById({
      scenarioId: id
    }).then((data) => {
      setDate(data)
    })
  }, [])

  return (
    <>
      <DialogEditScene editSceneModel={editSceneModel} setEditSceneModel={setEditSceneModel} setDate={setDate}/>
      <DialogEditSceneParam editSceneParamModel={editSceneParamModel} setEditSceneParamModel={setEditSceneParamModel}
                            setDate={setDate}/>
      <DataFields dataSource={data} items={items}/>
      <Button type={'primary'} size={'small'} onClick={() => {
        setEditSceneModel({
          ...editSceneModel,
          scenarioId: data.scenarioId,
          name: data.name,
          supportScopeTypes: data.supportScopeTypes ? data.supportScopeTypes : [],
          categories: data.categories ? data.categories.map((item: any) => item.categoryId) : [],
          visible: true
        })
      }}>编辑</Button>
      <hr/>
      <Table
        title={'参数列表'}
        dataSource={data.parameters}
        primaryKey="id"
      >
        <Table.Column dataIndex={'paramName'} title={'参数名称'}/>
        <Table.Column dataIndex={'alias'} title={'别名'}/>
        <Table.Column dataIndex={'description'} title={'描述'}/>
        <Table.Column dataIndex={'required'} title={'是否必填'} cell={(value: any) => {
          if (value) {
            return '是'
          } else {
            return '否'
          }
        }}/>
        <Table.Column title={'操作'} cell={(value: string, rowIndex: number, record: any, context: any) => {
          const {parameterId, paramName, description, defaultValue, component, alias, required} = record
          return <Actions>
            <LinkButton Component={"a"}
                        onClick={() => {
                          setEditSceneParamModel(
                            {
                              ...editSceneParamModel,
                              scenarioId: data.scenarioId,
                              parameterId: parameterId,
                              paramName: paramName,
                              description: description,
                              defaultValue: defaultValue,
                              component: component ? component : {type: '', values: []},
                              alias: alias,
                              required: required ? 'true' : 'false',
                              visible: true
                            }
                          )
                        }}>
              编辑
            </LinkButton>
          </Actions>
        }}/>
      </Table>
    </>
  )
}

ScenarioDetail.title = 'menu.scenario.detail'
ScenarioDetail.crumb = [{name: 'menu.scenario.list', route: '/scenario/list'}, {name: 'menu.scenario.detail'}]

export default ScenarioDetail;
