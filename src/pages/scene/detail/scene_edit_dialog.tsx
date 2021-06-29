import React, {useEffect, useState} from "react";
import {getScenarioById, getScenarioCategories, updateScenario} from "@/services/scenarios";
import {Dialog, Form, Loading, Select} from "@alicloud/console-components";

const FormItem = Form.Item

const {Option} = Select

const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
}

export interface EditSceneModel {
  visible: boolean
  loading: boolean
  scenarioId?: string
  supportScopeTypes?: any
  categories?: Array<any>
  name?: string
}

export const DialogEditScene = (props: any) => {

  const {editSceneModel, setEditSceneModel, setDate} = props
  const {visible, name, scenarioId, loading, categories, supportScopeTypes} = editSceneModel

  const [category, setCategory] = useState<Array<any>>([])

  useEffect(() => {
    getScenarioCategories().then(function (data) {
      setCategory(data.map((item: any) => ({
          label: item.name,
          value: item.categoryId,
          children: item.children.map((item: any) => (
            {
              label: item.name,
              value: item.categoryId,
            }))
        })
      ))
    })
  }, [])

  return <Loading visible={loading} fullScreen>
    <Dialog title={'编辑场景'}
            isFullScreen={true}
            visible={visible}
            onOk={() => {
              setEditSceneModel({...editSceneModel, loading: true})
              updateScenario({
                scenarioId: scenarioId,
                categoryIds: categories,
                supportScopeTypes: supportScopeTypes
              }).then(() => {
                setEditSceneModel({
                  visible: false,
                  categories: [],
                  supportScopeTypes: []
                })

                getScenarioById({
                  scenarioId: scenarioId
                }).then((data) => {
                  setDate(data)
                })

              }).finally(() => {
                setEditSceneModel({...editSceneModel, visible: false, loading: false})
              })
            }}
            onCancel={() => {
              setEditSceneModel({...editSceneModel, visible: false, loading: false})
            }}
            onClose={() => {
              setEditSceneModel({...editSceneModel, visible: false, loading: false})
            }}>
      <Form style={{width: 550}} {...formItemLayout}>
        <FormItem required label="场景名称:">
          <p>{name}</p>
        </FormItem>
        <FormItem required label="支持维度:">
          <Select name="size" value={supportScopeTypes.length > 0 ? supportScopeTypes[0] : ""} style={{width: '100%'}}
                  onChange={(value) => {
                    setEditSceneModel({
                      ...editSceneModel,
                      supportScopeTypes: [value]
                    })
                  }}
          >
            <Option value="host">主机</Option>
            <Option value="node">节点</Option>
            <Option value="pod">Pod</Option>
            <Option value="container">容器</Option>
          </Select>
        </FormItem>

        <FormItem required label="所属类目:">
          <Select
            maxTagCount={2}
            value={categories}
            mode="multiple"
            onChange={(value: any, actionType: String, item: any) => {
              setEditSceneModel({
                ...editSceneModel,
                categories: value
              })
            }}
            dataSource={category}
            style={{width: '100%'}}
          />
        </FormItem>
      </Form>
    </Dialog>
  </Loading>
}
