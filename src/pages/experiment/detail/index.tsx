import React, {useEffect, useState} from 'react'
import '@alicloud/console-components/dist/wind.css'
import {Button, Card, Form, Grid, Icon, Input, Tab, Message, Loading} from '@alicloud/console-components'
import DataFields, {IDataFieldsProps} from '@alicloud/console-components-data-fields'
import ExperimentDevice from "./experiment_device";
import ExperimentMetric from "./experiment_metric";
import SlidePanel from "@alicloud/console-components-slide-panel";
import TaskTab from "../task/index";
import {startExperiment} from "@/services/experiment";
import {getExperimentById} from "@/services/experimentDetail";
import url from "url";
import {useHistory} from "react-router-dom";
import Truncate from "@alicloud/console-components-truncate";
import {
  longFootLineStyle,
  longHeadLineStyle,
  LongLineStyle,
  normalLineStyle
} from "@/pages/experiment/creating/experiment_content";

const formItemLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 15},
}

const items: IDataFieldsProps['items'] = [
  {
    dataIndex: 'experimentName',
    render: val => <h1>{val}</h1>,
    span: 24,
  },
  {
    dataIndex: 'taskCount',
    label: '执行次数',
  },
  {
    dataIndex: 'description',
    label: '描述',
    span: 24,
    render: () => {
      return '-'
    }
  },
  {
    dataIndex: 'description',
    label: '执行策略',
    span: 24,
    render: () => {
      return '顺序执行'
    }
  },
  {
    dataIndex: 'description',
    label: '自动恢复时间',
    span: 24,
    render: () => {
      return '-'
    }
  }
]

const taskCard = {
  style: {
    height: 120,
    margin: 5,
    border: '1px solid #0070cc',
    boxShadow: '0 0 4px 0 rgb(0 112 204 / 75%)',
  } as React.CSSProperties,
}

const WrapperZero = (props: any) => {

  const {activity, setAlickActivityId} = props

  return <>
    <Grid.Col span={"3"}/>
    <Grid.Col span={"8"}>
      <Card {...taskCard}
            title={activity.scene.original}
            subTitle={activity.scene.version}
            onClick={() => {
              setAlickActivityId(activity.activityId)
            }}
      >
        <div>
          <Truncate type="width" threshold={"auto"}>
            {activity.activityName}
          </Truncate>
        </div>
      </Card>
    </Grid.Col>
  </>
}

const WrapperOne = (props: any) => {

  const {activity, setAlickActivityId} = props

  return <>
    <Grid.Col span={"3"}>
      <div {...normalLineStyle} >
        <Icon type="caret-right" style={{position: "relative", right: -9, top: -9, color: "#ebebeb", float: "right"}}/>
      </div>
    </Grid.Col>
    <Grid.Col span={"8"}>
      <Card {...taskCard}
            title={activity.scene.original}
            subTitle={activity.scene.version}
            onClick={() => {
              setAlickActivityId(activity.activityId)
            }}
      >
        <div>
          <Truncate type="width" threshold={"auto"}>
            {activity.activityName}
          </Truncate>
        </div>
      </Card>
    </Grid.Col>
  </>
}

const WrapperTwo = (props: any) => {

  const {activity, setAlickActivityId} = props

  return <>
    <Grid.Col span={"6"}/>
    <Grid.Col span={"1"}>
      <div {...longFootLineStyle} >
        <Icon type="sort-down"
              style={{position: "relative", right: -9, bottom: -13, color: "#ebebeb", float: "right"}}/>
      </div>
    </Grid.Col>
    <Grid.Col span={"11"}>
      <div {...LongLineStyle} />
    </Grid.Col>
    <Grid.Col span={"1"}>
      <div {...longHeadLineStyle} />
    </Grid.Col>
    <Grid.Col span={"4"}/>

    <Grid.Col span={"3"}/>
    <Grid.Col span={"8"}>
      <Card {...taskCard}
            title={activity.scene.original}
            subTitle={activity.scene.version}
            onClick={() => {
              setAlickActivityId(activity.activityId)
            }}
      >
        <Truncate type="width" threshold={"auto"} style={{width: '100%'}}>
          {activity.activityName}
        </Truncate>
      </Card>
    </Grid.Col>
  </>
}

const ExperimentDetail = () => {

  const [runExperimentProcessing, setRunExperimentProcessing] = useState(false)

  const [experimentDetail, setExperimentDetail] = useState<any>({})
  const [machines, setMachines] = useState<Array<any>>([])
  const [metrics, setMetrics] = useState<Array<any>>([])
  const [activities, setActivities] = useState<Array<any>>([])
  const [clickActivityId, setAlickActivityId] = useState<string>()

  const history = useHistory();
  const experimentId = url.parse(history.location.search, true).query.experimentId as string

  const getExperimentDetail = (experimentId: string) => {
    return getExperimentById(experimentId)
  }

  useEffect(() => {
    getExperimentDetail(experimentId).then((data) => {
      setExperimentDetail(data)
      setMachines(data.machines)
      setMetrics(data.metrics)
      setActivities(data.activities)
    })
  }, [])

  return (
    <>
      <DataFields dataSource={experimentDetail} items={items}/>
      <Grid.Row>
        <Button size={"small"} type={"primary"} loading={runExperimentProcessing} onClick={() => {
          setRunExperimentProcessing(true)
          startExperiment(experimentId).then((result) => {
            if (result) {
              history.push(`/experiment/task/detail?taskId=${result.taskId}`);
            }
          }).finally(() => {
            setRunExperimentProcessing(false)
          })
        }}>执行演练</Button>

        <Button size={"small"} type={"primary"} style={{marginLeft: 10}} onClick={() => {
          history.push(`/experiment/creating?experimentId=${experimentId}`)
        }}>编辑演练</Button>
      </Grid.Row>
      <Tab style={{marginTop: 10}}>
        <Tab.Item key="basic" title="演练流程">

          <div style={{backgroundColor: "rgb(247, 247, 247)", padding: 10, marginTop: 10}}>
            <Grid.Row wrap={true}>
              {activities.map((activity: any, index: number) => {
                if (index == 0) {
                  return <WrapperZero activity={activity}
                                      setAlickActivityId={setAlickActivityId}/>
                }
                if (index % 2 === 0) {
                  return <WrapperTwo activity={activity}
                                     setAlickActivityId={setAlickActivityId}
                  />
                } else {
                  return <WrapperOne activity={activity}
                                     setAlickActivityId={setAlickActivityId}/>
                }
              })}
            </Grid.Row>
          </div>

          {activities.map((activity: any) => {
            const {scene} = activity
            return <SlidePanel
              key={`${activity.activityId}-${scene.scenarioId}`}
              title={scene.name + "-" + scene.version}
              isShowing={activity.activityId === clickActivityId}
              onMaskClick={() => {
                setAlickActivityId(undefined)
              }}
              hasMask
              width="small"
              onClose={() => {
                setAlickActivityId(undefined)
              }}
            >
              <Form {...formItemLayout}>
                {scene.parameters.map((item: any) => {
                  return (
                    <Form.Item labelAlign={"top"}
                               label={item.name + ":"}>
                      <p style={{backgroundColor: 'rgb(247,247,247)'}}>{item.value ? item.value: "-"}</p>
                    </Form.Item>
                  )
                })}
              </Form>
            </SlidePanel>
          })}

        </Tab.Item>
        <Tab.Item key="record" title="演练机器">
          <ExperimentDevice machines={machines}/>
        </Tab.Item>
        <Tab.Item key="metric" title="监控">
          <ExperimentMetric metrics={metrics}/>
        </Tab.Item>
        <Tab.Item key="taskList" title="演练记录">
          <TaskTab experimentId={experimentId}/>
        </Tab.Item>
      </Tab>
    </>
  )
}

ExperimentDetail.title = 'menu.experiment.detail'
ExperimentDetail.crumb = [{name: 'menu.experiment', route: '/experiment'}, {name: 'menu.experiment.detail'}]

export default ExperimentDetail;
