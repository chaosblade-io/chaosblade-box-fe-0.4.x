import React, {useEffect, useState} from "react";
import {Dialog, Grid, Checkbox, Input, Form} from "@alicloud/console-components";
import Page from '@alicloud/console-components-page'
import {queryMetricCategory} from "@/services/metric";
import {connect} from "umi";

const {Menu} = Page

export interface Metric {
  name: string
  categoryId: number
  code: string
  children?: Array<Metric>
  params: Array<MetricParam>
}

interface MetricParam {
  name: string
  value: string
}

const ExperimentMetricDialog = (props: any) => {
  const {dispatch, experimentCreate} = props

  const [metrics, setMetrics] = useState<Array<Metric>>([])
  const [metric, setMetric] = useState<Metric>()
  const [selectedMetrics, setSelectedMetrics] = useState<Array<number>>([])

  const {scenariosDialog, showScenariosDialog} = props

  useEffect(() => {
    queryMetricCategory({}).then(function (data) {
      let metrics: Array<Metric> = []
      data.map((item: Metric) => {
        let children: Array<Metric> = []
        if (item.children) {
          item.children.map((item: Metric) => {
            let params = item.params.map((param: any) => {
              const {defaultValue} = param
              if (defaultValue !== null) {
                return {...param, value: defaultValue}
              } else {
                return {...param, value: ''}
              }
            })
            children.push({...item, params: params})
          })
        }
        item = {...item, children: children}
        metrics.push(item)
      })
      setMetrics(metrics)
    })
  }, [])

  useEffect(() => {
    if (metric) {
      setMetrics(metrics.map((father) => {
        const {children} = father
        if (children) {
          let newChildren = children.map((item: Metric) => {
            if (item.categoryId === metric.categoryId) {
              return metric
            }
            return item
          })
          return {...father,
            children: newChildren
          }
        }
        return father
      }))
    }
  }, [metric]);

  return (
    <Dialog title="请选择监控"
            visible={scenariosDialog}
            onOk={() => {
              const selected: Array<Metric> = new Array<Metric>()

              metrics.map((father) => {
                const {children} = father
                if (children) {
                  children.map((item: Metric) => {
                    let categoryId = selectedMetrics.find(v => v == item.categoryId);
                    if (categoryId) {
                      selected.push(item)
                    }
                  })
                }
              })

              const payload = {metrics: selected}
              dispatch({
                type: 'experimentCreate/selectMetrics',
                payload,
              });
              selectedMetrics.length = 0
              showScenariosDialog(false)
            }}
            onClose={() => {
              selectedMetrics.length = 0
              showScenariosDialog(false)
            }}
            onCancel={() => {
              selectedMetrics.length = 0
              showScenariosDialog(false)
            }}>
      <Page style={{width: 920, height: 600}}>
        <Page.Header/>
        <Page.Content menu={<ExperimentMetricCategory setMetric={setMetric}
                                                      metrics={metrics}
                                                      selectedMetrics={selectedMetrics}
                                                      setSelectedMetrics={setSelectedMetrics}
        />}>
          <Grid.Row wrap>
            <ExperimentMetricForm metric={metric} setMetric={setMetric}/>
          </Grid.Row>
        </Page.Content>
      </Page>
    </Dialog>
  )
}

const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
}

const ExperimentMetricCategory = (props: any) => {

  const {metrics, setMetric, selectedMetrics, setSelectedMetrics} = props

  return (
    <Menu>{metrics.map((father: Metric) => {

      const {children} = father;

      if (children === undefined) {
        return <Menu.SubMenu key={father.categoryId} label={father.name}/>
      } else {
        return <Menu.SubMenu key={father.categoryId} label={father.name}>
          {children.map((item: any) => {
            return <Menu.Item key={item.categoryId}>
              <Checkbox key={item.categoryId} id={item.categoryId} label={item.name}
                        onChange={(checked: Boolean, e: Event) => {
                          const {categoryId} = item
                          if (checked) {
                            setSelectedMetrics([...selectedMetrics, categoryId])
                          } else {
                            let index = selectedMetrics.findIndex((categoryId: number) => categoryId === item.categoryId);
                            if (index >= 0) {
                              selectedMetrics.splice(index, 1)
                            }
                          }
                        }}
                        onClick={() => {
                          setMetric(item)
                        }}/>
            </Menu.Item>
          })}
        </Menu.SubMenu>
      }
    })}</Menu>
  )
}

const ExperimentMetricForm = (props: any) => {

  const {metric, setMetric} = props

  return metric ? <Form style={{width: 550}} {...formItemLayout}>
    <Form.Item required label="监控名称:">
      <Input placeholder="name" name="name" value={metric.name}
             onChange={(value) => {
             }}/>
    </Form.Item>

    {metric.params ? metric.params.map((param: any) => {
      return <Form.Item required label={param.name} key={param.name}>
        <Input placeholder={param.name} name={param.name}
               value={param.value}
               onChange={(value) => {
                 let params = metric.params.map((p: any) => {
                   if (p.name === param.name) {
                     return {
                       ...param,
                       value: value
                     }
                   }
                   return p
                 })
                 setMetric({...metric, params: params})
               }}/>
      </Form.Item>
    }) : <></>}
  </Form> : <></>
}

export default connect(
  ({experimentCreate}: any) => ({experimentCreate}),
)(ExperimentMetricDialog);
