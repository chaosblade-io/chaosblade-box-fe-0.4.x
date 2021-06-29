import React, {useState} from "react";
import {Button, Card, Form, Grid, Icon, Input} from "@alicloud/console-components";
import {CommonProps} from "./experiment_scene_dialog"
import {connect} from "umi";
import ExperimentMetricDialog, {Metric} from "@/pages/experiment/creating/experiment_metric_dialog";
import {showConfirmDialog} from "@alicloud/console-components-confirm";

const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
}

const ExperimentMetrics = (props: any) => {

  const {experimentCreate, dispatch} = props
  const {selectMetrics} = experimentCreate

  const [scenariosDialog, showScenariosDialog] = useState(false)

  return (
    <div>
      <Button type="secondary" size="small" onClick={() => {
        showScenariosDialog(true)
      }}>添加监控</Button>

      <ExperimentMetricDialog scenariosDialog={scenariosDialog} showScenariosDialog={showScenariosDialog}/>

      <div style={{padding: 10, marginTop: 10, backgroundColor: "rgb(247, 247, 247)"}}>
        <Icon type="ashbin" size={"xs"} onClick={() => {
          const payload = {metrics: []}
          dispatch({
            type: 'experimentCreate/selectMetrics',
            payload,
          });
        }}/>
        <Grid.Row wrap={true}>
          {selectMetrics.map((metric: Metric, index: number) => {

            return <Grid.Col span={"8"} key={metric.categoryId}>
              <Card {...CommonProps}
                    title={metric.name}
                    extra={<Icon size="xs" type="success"/>} onClick={() => {
                showConfirmDialog({
                  type: 'help',
                  title: `${metric.name}`,
                  content: <Form style={{width: 550}} {...formItemLayout}>{
                    metric.params ? metric.params.map((param: any) => {
                      return <Form.Item required label={param.name} key={param.name}>
                        <Input type={'textarea'} placeholder={param.name} name={param.name}
                               defaultValue={param.value} onChange={(value) => {

                          const payload = {categoryId: metric.categoryId, param: {name: param.name, value: value}}
                          dispatch({
                            type: 'experimentCreate/fillMetricsParams',
                            payload,
                          });

                        }}/>
                      </Form.Item>
                    }) : <></>
                  }</Form>,
                })
              }}>
                {metric.code}
              </Card>
            </Grid.Col>
          })}
        </Grid.Row>
      </div>
    </div>
  )
}

export default connect(
  ({experimentCreate}: any) => ({experimentCreate}),
)(ExperimentMetrics);

