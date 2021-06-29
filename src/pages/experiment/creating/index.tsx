import React, {useEffect} from 'react'

import {Form, Input, Loading, Radio, Message} from '@alicloud/console-components'
import ExperimentDevice from "./experiment_device"
import {connect} from "umi";
import ExperimentMetrics from './experiment_metric'
import ExperimentContent from './experiment_content'
import {createExperiment, updateExperiment} from "@/services/experiment";
import url from "url";
import _ from 'lodash'

const FormItem = Form.Item
const RadioGroup = Radio.Group

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
}

const CreateExperiment = (props: any) => {

  const {experimentCreate, dispatch, history} = props
  const {experimentName, dimension, selectMachines, selectMetrics, scenarios, loading} = experimentCreate
  const {experimentId} = url.parse(history.location.search, true).query

  useEffect(() => {
    return () => {
      dispatch({
        type: 'experimentCreate/clear'
      });
    }
  }, [])

  return (
    <Loading visible={loading} fullScreen>
      <Form {...formItemLayout}>
        <FormItem label="演练名称:" required hasFeedback requiredMessage="请输入演练名称">
          <Input name="experimentName" value={experimentName} onChange={(experimentName) => {
            const payload = {experimentName: experimentName}
            dispatch({
              type: 'experimentCreate/fillExperimentName',
              payload,
            });
          }}/>
        </FormItem>

        {
          experimentId ? <FormItem
            label="演练维度:"
            required
            hasFeedback
            >  <p className="next-form-text-align">{dimension}</p></FormItem> :

            <FormItem
              label="演练维度:"
              hasFeedback
              required
              requiredMessage="请选择演练维度"
            >
              <RadioGroup name="valSex" onChange={(dimension) => {
                const payload = {dimension: dimension}
                dispatch({
                  type: 'experimentCreate/selectDimension',
                  payload,
                });
              }} value={dimension}>
                <Radio value="host">主机</Radio>
                <Radio value="node">Node</Radio>
                <Radio value="pod">Pod</Radio>
                <Radio value="container">Container</Radio>
                {/*<Radio value="application">应用</Radio>*/}
              </RadioGroup>
            </FormItem>
        }

        <FormItem
          label="机器选择:"
          hasFeedback
          required
          requiredMessage="Please enter password"
        >
          <ExperimentDevice/>
        </FormItem>

        <FormItem
          label="演练内容:"
          required
          requiredMessage="请选择演练内容"
        >

          <ExperimentContent/>

        </FormItem>

        <FormItem
          label="监控:"
          required
          requiredMessage="请选择演练内容"
        >

          <ExperimentMetrics/>

        </FormItem>

        <FormItem wrapperCol={{offset: 6}}>
          <Form.Submit
            validate
            type="primary"
            onClick={() => {
              if (_.isEmpty(experimentName)) {
                Message.error("请填写演练名称")
                return
              }

              if (scenarios.length === 0) {
                Message.error("请选择演练内容")
                return
              }

              if (selectMachines.length === 0) {
                Message.error("请选择演练机器")
                return
              }

              dispatch({
                type: 'experimentCreate/loading',
                payload: {loading: true}
              });

              if (experimentId) {
                updateExperiment(experimentId ,{
                  experimentName: experimentName,
                  dimension: dimension,
                  scenarios: scenarios,
                  selectMachines: selectMachines,
                  selectMetrics: selectMetrics
                }).then((data) => {
                  const {experimentId} = data
                  dispatch({
                    type: 'experimentCreate/clear'
                  });
                  history.push(`/experiment/detail?experimentId=${experimentId}`)
                }).finally(() => {
                  dispatch({
                    type: 'experimentCreate/loading',
                    payload: {loading: false}
                  });
                })
              } else {
                createExperiment({
                  experimentName: experimentName,
                  dimension: dimension,
                  scenarios: scenarios,
                  selectMachines: selectMachines,
                  selectMetrics: selectMetrics
                }).then((data) => {
                  const {experimentId} = data
                  dispatch({
                    type: 'experimentCreate/clear'
                  });
                  history.push(`/experiment/detail?experimentId=${experimentId}`)
                }).finally(() => {
                  dispatch({
                    type: 'experimentCreate/loading',
                    payload: {loading: false}
                  });
                })
              }
            }}
            style={{marginRight: 10}}
          >
            提交
          </Form.Submit>
        </FormItem>
      </Form>
    </Loading>
  )
}



let CreateExperimentX: any = connect(
  ({experimentCreate}: any) => ({experimentCreate}),
)(CreateExperiment);

CreateExperimentX.title = 'menu.experiment.creating'
CreateExperimentX.crumb = [{name: 'menu.experiment', route: '/experiment'}, {name: 'menu.experiment.creating'}]

export default CreateExperimentX;
