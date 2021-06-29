import React, {useEffect, useState} from "react";
import {Collapse, Dialog, Form, Grid, Icon, Input, Loading, Radio, Select} from "@alicloud/console-components";
import {getScenarioById, updateSceneParam} from "@/services/scenarios";
import {LinkButton} from "@alicloud/console-components-actions";

const {Group: RadioGroup} = Radio
const FormItem = Form.Item

const {Row} = Grid

const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
}

export interface ComponentModel {
  type?: 'radio' | 'select',
  values: Array<any>
  editable?: boolean
}

export interface EditSceneParamModel {
  scenarioId?: string
  parameterId?: string
  paramName?: string
  description?: string
  defaultValue?: string
  alias?: string
  required?: string
  visible: boolean
  loading: boolean
  component?: ComponentModel
}

export const DialogEditSceneParam = (props: any) => {

  const {editSceneParamModel, setEditSceneParamModel, setDate} = props
  const {visible, loading, scenarioId, parameterId, paramName, description, defaultValue, alias, required, component} = editSceneParamModel

  return <Loading visible={loading} fullScreen>
    <Dialog title={'编辑场景参数'}
            isFullScreen={true}
            visible={visible}
            onOk={() => {
              setEditSceneParamModel({...editSceneParamModel, loading: true})
              updateSceneParam({
                parameterId: parameterId,
                description: description,
                defaultValue: defaultValue,
                alias: alias,
                isRequired: required,
                component: component
              }).then(() => {
                getScenarioById({
                  scenarioId: scenarioId
                }).then((data) => {
                  setDate(data)
                })
              }).finally(() => {
                setEditSceneParamModel({...editSceneParamModel, visible: false, loading: false})
              })
            }}
            onCancel={() => {
              setEditSceneParamModel({...editSceneParamModel, visible: false, loading: false})
            }}
            onClose={() => {
              setEditSceneParamModel({...editSceneParamModel, visible: false, loading: false})
            }}>

      <Form style={{width: 550}} {...formItemLayout}>
        <FormItem required label="名称:">
          <p>{paramName}</p>
        </FormItem>

        <FormItem required label="别名:">
          <Input name="alias" value={alias} onChange={(val) => {
            setEditSceneParamModel({...editSceneParamModel, alias: val})
          }}/>
        </FormItem>

        <FormItem label="描述:">
          <Input name="description" value={description} onChange={(val) => {
            setEditSceneParamModel({...editSceneParamModel, description: val})
          }}/>
        </FormItem>

        <FormItem label="默认值:">
          <Input name="defaultValue" value={defaultValue} onChange={(val) => {
            setEditSceneParamModel({...editSceneParamModel, defaultValue: val})
          }}/>
        </FormItem>

        <FormItem label="是否必填:">
          <RadioGroup dataSource={[
            {
              value: 'true',
              label: '是'
            },
            {
              value: 'false',
              label: '否'
            },
          ]} value={required} onChange={(val) => {
            setEditSceneParamModel({...editSceneParamModel, required: val})
          }}/>
        </FormItem>

        <Collapse accordion dataSource={[
          {
            title: '组件配置',
            content: <Component editSceneParamModel={editSceneParamModel}
                                setEditSceneParamModel={setEditSceneParamModel}/>
          }
        ]} defaultExpandedKeys={["0"]}/>

      </Form>
    </Dialog>
  </Loading>
}

const Component = (props: any) => {

  const {editSceneParamModel, setEditSceneParamModel} = props
  const [visible, setVisible] = useState<boolean>(false)
  const [rangeVisible, setRangeVisible] = useState<boolean>(false)

  const {component} = editSceneParamModel

  useEffect(() => {
    if (component.type === 'select' || component.type === 'radio') {
      setVisible(true)
    }
    if (component.type === 'range') {
      setRangeVisible(true)
    }
  }, [])

  return <Form style={{width: 550}} {...formItemLayout}>
    <FormItem label="组件类型:">
      <Select value={editSceneParamModel.component.type} name="size" style={{width: '100%'}}
              onChange={(value) => {
                if (value === 'select' || value === 'radio') {
                  setVisible(true)
                } else {
                  setVisible(false)
                }
                if (value === 'range') {
                  setRangeVisible(true)
                } else {
                  setRangeVisible(false)
                }

                setEditSceneParamModel({
                  ...editSceneParamModel, component: {
                    ...editSceneParamModel.component,
                    type: value,
                    values: []
                  }
                })
              }}
      >
        <Select.Option value="">--请选择--</Select.Option>
        <Select.Option value="select">select</Select.Option>
        <Select.Option value="radio">radio</Select.Option>
        <Select.Option value="textArea">textArea</Select.Option>
        <Select.Option value="number">number</Select.Option>
        <Select.Option value="script">script</Select.Option>
        <Select.Option value="range">range</Select.Option>
      </Select>
    </FormItem>
    {
      rangeVisible ? <FormItem label="可选项:"> <Form inline><Row gutter={18}> <FormItem label="min:" labelAlign={'inset'}>
        <Input value={component.minValue} onChange={(val) => {
          setEditSceneParamModel({
            ...editSceneParamModel, component: {
              ...editSceneParamModel.component,
              minValue: val
            }
          })
        }}/>
      </FormItem>
        <FormItem label="max:" labelAlign={'inset'}>
          <Input value={component.maxValue} onChange={(val) => {
            setEditSceneParamModel({
              ...editSceneParamModel, component: {
                ...editSceneParamModel.component,
                maxValue: val
              }
            })
          }}/>
        </FormItem>
      </Row>
      </Form></FormItem> : ''
    }
    {
      visible ? <FormItem label="可选项:">
        <Icon type={'add'} size='inherit' style={{color: '#0070CC', cursor: 'pointer'}} onClick={() => {
          setEditSceneParamModel({
            ...editSceneParamModel, component: {
              ...editSceneParamModel.component,
              values: [...editSceneParamModel.component.values.map((item: any, index: number) => {
                return {
                  ...item,
                  key: index
                }
              }), {key: editSceneParamModel.component.values.length}]
            }
          })
        }}/>
        <Form inline>
          {editSceneParamModel.component.values.map((item: any) => {
            const {key} = item
            return <ComponentSelect key={key}
                                    value={item}
                                    editSceneParamModel={editSceneParamModel}
                                    setEditSceneParamModel={setEditSceneParamModel}
                                    deleteComponentSelect={() => {
                                      editSceneParamModel.component.values.splice(key, 1);
                                      setEditSceneParamModel({
                                        ...editSceneParamModel, component: {
                                          ...editSceneParamModel.component,
                                          values: [...editSceneParamModel.component.values.map((item: any, index: number) => {
                                            return {
                                              ...item,
                                              key: index
                                            }
                                          })]
                                        }
                                      })
                                    }}/>
          })}
        </Form>
      </FormItem> : ''
    }
  </Form>
}

const ComponentSelect = (props: any) => {

  const {value, editSceneParamModel, setEditSceneParamModel, deleteComponentSelect} = props

  return <Row gutter={24}>
    <FormItem label="label:" labelAlign={'inset'}>
      <Input value={value.label} onChange={(val) => {
        let values = editSceneParamModel.component.values.map((item: any) => {
          if (item.key === value.key) {
            return {
              ...item,
              label: val
            }
          } else {
            return item
          }
        });
        setEditSceneParamModel({
          ...editSceneParamModel, component: {
            ...editSceneParamModel.component,
            values: [...values]
          }
        })
      }}/>
    </FormItem>
    <FormItem label="value:" labelAlign={'inset'}>
      <Input value={value.value} onChange={(val) => {
        let values = editSceneParamModel.component.values.map((item: any) => {
          if (item.key === value.key) {
            return {
              ...item,
              value: val
            }
          } else {
            return item
          }
        });
        setEditSceneParamModel({
          ...editSceneParamModel, component: {
            ...editSceneParamModel.component,
            values: [...values]
          }
        })
      }}/>

    </FormItem>
    <LinkButton Component={"a"} style={{width: 50, color: "red"}} onClick={() => {
      deleteComponentSelect()
    }}>删除</LinkButton>
  </Row>
}
