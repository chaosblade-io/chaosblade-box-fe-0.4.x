import React, {useEffect, useState} from 'react'
import '@alicloud/console-components/dist/wind.css'
import {Button, Card, Form, Grid, Icon, Loading, Progress, Tab, Tag} from '@alicloud/console-components'
import Truncate from '@alicloud/console-components-truncate'
import DataFields from '@alicloud/console-components-data-fields'
import url from "url";
import _ from 'lodash'
import moment from 'moment'
import {failRetryActivityTask, queryTaskRecord, queryTaskResult} from "@/services/experimentTask";
import {startExperiment, stopExperiment} from "@/services/experiment";
import {
  longFootLineStyle,
  longHeadLineStyle,
  LongLineStyle,
  normalLineStyle
} from "@/pages/experiment/creating/experiment_content";
import Action, {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from "@alicloud/console-components-confirm";
import {useHistory} from "react-router-dom";
import SlidePanel from "@alicloud/console-components-slide-panel";
import TaskDetailLog from "@/pages/experiment/task/detail/task_detail_logs";
import TaskDetailMetric from "@/pages/experiment/task/detail/task_detail_metric";

const formItemLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 15},
}

const taskCard = {
  style: {
    height: 120,
    margin: 5,
    border: '1px solid #0070cc',
    boxShadow: '0 0 4px 0 rgb(0 112 204 / 75%)',
  } as React.CSSProperties,
}

const getDuration = (startTime: string, endTime: string | undefined) => {

  const start = moment(new Date(startTime));
  const end = moment(endTime ? new Date(endTime) : new Date());
  const duration = moment.duration(end.diff(start));
  const days = _.floor(duration.as('days'));
  const hours = _.floor(duration.as('hours'));
  const minutes = _.floor(duration.as('minutes'));
  const seconds = _.floor(duration.as('seconds'));
  return {
    days,
    hours: hours - days * 24,
    minutes: minutes - hours * 60,
    seconds: seconds - minutes * 60
  };
}

const renderDuration = (duration?: any) => {
  return (
    <div>
      {duration.days > 0 ? <span>{duration.days} days &nbsp;</span> : ''}
      {duration.hours > 0 ? <span>{duration.hours} hours &nbsp;</span> : ''}
      {duration.minutes > 0 ? <span>{duration.minutes} mins &nbsp;</span> : ''}
      {duration.seconds > 0 ? <span>{duration.seconds} s</span> : ''}
    </div>
  );
}

const StatusTransfer: React.FC<{ activityTask: any }> = ({activityTask}) => {
  const {runStatus, resultStatus} = activityTask
  if (resultStatus !== null) {
    if (resultStatus === 0) {
      return <Icon type="success" size="small" style={{color: '#1DC11D'}}/>
    } else {
      return <Icon type="error" size="small" style={{color: '#FF3333', cursor: "pointer"}} onClick={() => {
        showConfirmDialog({
          type: "error",
          title: '执行失败',
          content: <p>{activityTask.errorMessage}</p>
        })
      }}/>
    }
  } else {
    if (runStatus === 0) {
      return <Icon size="small" type="caret-right"/>
    } else {
      return <Icon size="small" type="loading"/>
    }
  }
}

const WrapperActivityTask = (props: any) => {
  const {activityTask, activityTasks, setMachines, setActivityTasks, setAlickActivityTaskId, currentActivityTaskId, status} = props

  useEffect(() => {
    if (currentActivityTaskId == activityTask.id) {
      queryTaskRecord({taskId: activityTask.experimentTaskId, activityTaskId: activityTask.id})
        .then((data) => {
          setMachines(data)
        })
    }
  }, [])

  return <Grid.Col span={"8"}>
    <Card {...taskCard}
          title={activityTask.scene.original}
          subTitle={activityTask.scene.version}
          extra={<StatusTransfer activityTask={activityTask}/>}
    >
      <div>
        <Truncate type="width" threshold={"auto"}>
          {activityTask.activityName}
        </Truncate>
      </div>
      <Action style={{
        float: 'right',
        marginTop: 10
      }}>
        {
          activityTask.resultStatus === 1 && status !== 4 ? <LinkButton onClick={() => {
            failRetryActivityTask({activityTaskId: activityTask.id}).then(() => {
              let news = activityTasks.map((item: any) => {
                if (item.id === activityTask.id) {

                  return {
                    ...item,
                    resultStatus: null,
                    runStatus: 1
                  }
                } else {
                  return item;
                }
              })
              setActivityTasks(news)
            })
          }}>
            重试
          </LinkButton>: ""
        }
        <LinkButton onClick={() => {
          queryTaskRecord({taskId: activityTask.experimentTaskId, activityTaskId: activityTask.id})
            .then((data) => {
              setMachines(data)
            })
        }}>
          机器信息
        </LinkButton>
        <LinkButton style={{
          marginRight: -10
        }} onClick={() => {
          setAlickActivityTaskId(activityTask.id)
        }}>
          场景参数
        </LinkButton>
      </Action>
    </Card>
  </Grid.Col>
}

const WrapperZero = () => {
  return <>
    <Grid.Col span={"3"}/>
  </>
}

const WrapperOne = () => {

  return <>
    <Grid.Col span={"3"}>
      <div {...normalLineStyle} >
        <Icon type="caret-right" style={{position: "relative", right: -9, top: -9, color: "#ebebeb", float: "right"}}/>
      </div>
    </Grid.Col>
  </>
}

const WrapperTwo = () => {

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
    <Grid.Col span={"7"}/>
  </>
}

const TaskDetail = (props: any) => {

  const taskId: string = url.parse(props.location.search, true).query.taskId as string;

  const [taskName, setTaskName] = useState<string>()
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>()
  const [duration, setDuration] = useState<any>()
  const [visible, setVisible] = useState(true)
  const [activityTasks, setActivityTasks] = useState<Array<any>>([])
  const [machines, setMachines] = useState<Array<any>>([])
  const [status, setStatus] = useState<number>()
  const [experimentId, setExperimentId] = useState<string>("")
  const [experimentProcess, setExperimentProcess] = useState<number>(0)
  const [clickActivityTaskId, setAlickActivityTaskId] = useState<string>()
  const [currentActivityTaskId, setCurrentActivityTaskId] = useState<string>()

  const history = useHistory();

  const [stopExperimentProcessing, setStopRunExperimentProcessing] = useState(false)
  const [restartExperimentProcessing, setRestartExperimentProcessing] = useState(false)

  const queryTaskStatus = async (params: any, timeoutDuration?: any, timeoutStatus?: any) => {
    const result = await queryTaskResult(params)

    const {status, activityTasks, taskName, startTime, endTime, experimentId, activityTaskId} = result
    setStatus(status)
    setActivityTasks(activityTasks)
    setExperimentProcess(
      Math.ceil((activityTasks.filter((activityTask: any) => activityTask.resultStatus !== null).length / activityTasks.length) * 100)
    )
    setCurrentActivityTaskId(activityTaskId)
    setTaskName(taskName)
    setStartTime(startTime)
    setEndTime(endTime)
    if (status === 4) {
      clearInterval(timeoutDuration)
      clearInterval(timeoutStatus)
      setStopRunExperimentProcessing(false)
    }

    activityTasks.filter((activityTask: any) => {
      return activityTask.id === activityTaskId;
    }).map((activityTask: any) => {
      queryTaskRecord({taskId: activityTask.experimentTaskId, activityTaskId: activityTask.id})
        .then((data) => {
          setMachines(data)
        })
    })

    setExperimentId(experimentId)
    return result
  }

  useEffect(() => {
    let timeoutDuration: any, timeoutStatus: any

    queryTaskStatus({"taskId": taskId}).then((data) => {
      const {status, startTime, endTime} = data
      let duration = getDuration(startTime, endTime);
      setDuration(renderDuration(duration))

      if (status !== 4) {
        timeoutDuration = setInterval(() => {
          let duration = getDuration(startTime, endTime);
          setDuration(renderDuration(duration))
        }, 2000);

        timeoutStatus = setInterval(() => {
          queryTaskStatus({"taskId": taskId}, timeoutDuration, timeoutStatus)
        }, 2000);
      }
    }).finally(() => {
      setVisible(false)
    })

    return () => {
      clearInterval(timeoutDuration)
      clearInterval(timeoutStatus)
    }
  }, [])

  return (
    <Loading visible={visible} fullScreen={true}>
      <DataFields dataSource={{}} items={[]}>
        <DataFields.Item span={24} render={(v: any) => {
          return <h1> {taskName} </h1>
        }}/>
        <DataFields.Item label={"开始时间"} render={(v: any) => {
          return {startTime}.startTime
        }}/>
        <DataFields.Item label={"结束时间"} render={(v: any) => {
          return {endTime}.endTime
        }}/>
        <DataFields.Item span={24} label={"持续时长"} render={(v: any) => {
          return {duration}.duration
        }}/>
        <DataFields.Item span={24} label={"演练进度"} render={(v: any) => {
          return <Progress percent={experimentProcess} size="large"/>
        }}/>
      </DataFields>

      <Grid.Row>
        {status === 4 ? <Button size={"small"} type={"primary"} loading={restartExperimentProcessing}
                                onClick={() => {
                                  setRestartExperimentProcessing(true)

                                  startExperiment(experimentId)
                                    .then((result) => {
                                      if (result) {
                                        history.push(`/experiment/task/detail?taskId=${result.taskId}`);

                                        setVisible(true)
                                        queryTaskStatus({"taskId": result.taskId}).then((data) => {
                                          const {status, startTime, endTime} = data
                                          let duration = getDuration(startTime, endTime);
                                          setDuration(renderDuration(duration))

                                          if (status !== 4) {
                                            let timeoutDuration: any, timeoutStatus: any

                                            timeoutDuration = setInterval(() => {
                                              let duration = getDuration(startTime, endTime);
                                              setDuration(renderDuration(duration))
                                            }, 1000)

                                            timeoutStatus = setInterval(() => {
                                              queryTaskStatus({"taskId": result.taskId}, timeoutDuration, timeoutStatus)
                                            }, 1000);
                                          }
                                        }).finally(() => {
                                          setVisible(false)
                                        })
                                      }
                                    }).finally(() => {
                                    setRestartExperimentProcessing(false)
                                  })
                                }}>重新运行</Button>

          : <Button size={"small"} loading={stopExperimentProcessing} warning
                    onClick={() => {
                      setStopRunExperimentProcessing(true)
                      stopExperiment(taskId)
                    }}>终止演练</Button>
        }

      </Grid.Row>
      <Tab style={{marginTop: 10}}>
        <Tab.Item key="process" title="演练流程">
          <Grid.Row>
            <Grid.Col span={16} style={{padding: 10}}>
              <div style={{backgroundColor: "rgb(247, 247, 247)", padding: 10}}>
                <Grid.Row wrap={true}>
                  {activityTasks.map((activityTask: any, index: number) => {
                    if (index == 0) {
                      return <>
                        <WrapperZero/>
                        <WrapperActivityTask activityTask={activityTask}
                                             setMachines={setMachines}
                                             activityTasks={activityTasks}
                                             setActivityTasks={setActivityTasks}
                                             currentActivityTaskId={currentActivityTaskId}
                                             status={status}
                                             setAlickActivityTaskId={setAlickActivityTaskId}/>
                      </>
                    }
                    if (index % 2 === 0) {
                      return <>
                        <WrapperTwo/>
                        <WrapperActivityTask activityTask={activityTask}
                                             setMachines={setMachines}
                                             setActivityTasks={setActivityTasks}
                                             currentActivityTaskId={currentActivityTaskId}
                                             status={status}
                                             setAlickActivityTaskId={setAlickActivityTaskId}/>
                      </>
                    } else {
                      return <>
                        <WrapperOne/>
                        <WrapperActivityTask activityTask={activityTask}
                                             setMachines={setMachines}
                                             setActivityTasks={setActivityTasks}
                                             currentActivityTaskId={currentActivityTaskId}
                                             status={status}
                                             setAlickActivityTaskId={setAlickActivityTaskId}/>
                      </>
                    }
                  })}
                </Grid.Row>
              </div>
            </Grid.Col>
            <Grid.Col span={8} style={{padding: 10}}>
              <Card title={'机器信息'} contentHeight={200}>
                <Tag.Group>
                  <Tag.Selectable defaultChecked type="primary" color={"green"}>成功: {
                    machines.filter((value) => {
                      return value.gmtStart && value.success;
                    }).length
                  }</Tag.Selectable>
                  <Tag.Selectable type="primary" color={"red"}>失败: {
                    machines.filter((value) => {
                      return value.gmtStart && !value.success;
                    }).length
                  } </Tag.Selectable>
                  <Tag.Selectable type="primary">待运行: {
                    machines.filter((value) => {
                      return !value.gmtStart;
                    }).length
                  }</Tag.Selectable>
                  <Tag.Selectable type="primary" color={"blue"}>运行中: {
                    machines.filter((value) => {
                      return value.gmtStart && (value.success === null)
                    }).length
                  }</Tag.Selectable>
                </Tag.Group>
                <hr/>
                <Grid.Row wrap={true}>
                  {
                    machines.map((item: any, index) => {
                      let color;
                      if (item.gmtStart) {
                        if (item.success) {
                          color = 'green'
                        } else if (item.success === null) {
                          color = 'blue'
                        } else {
                          color = 'red'
                        }
                      }
                      return <Grid.Col key={index} span={12}>
                        <Tag type="normal" color={color} onClick={() => {
                          showConfirmDialog({
                            type: "notice",
                            title: '机器信息',
                            content: <p><Form style={{width: 450}}
                                              labelCol={{span: 6}}
                                              wrapperCol={{span: 14}}>
                              <Form.Item label="Identity: ">
                                <p className="next-form-text-align">
                                  {item.hostname}
                                </p>
                              </Form.Item>
                              <Form.Item label="开始时间: ">
                                <p className="next-form-text-align">
                                  {item.gmtStart}
                                </p>
                              </Form.Item>
                              <Form.Item label="结束时间: ">
                                <p className="next-form-text-align">
                                  {item.gmtEnd}
                                </p>
                              </Form.Item>
                              <Form.Item label="运行结果: ">
                                <p className="next-form-text-align">
                                  {item.result}
                                </p>
                              </Form.Item>
                              <Form.Item label="错误信息: ">
                                <p className="next-form-text-align">
                                  {item.errorMessage}
                                </p>
                              </Form.Item>
                            </Form>
                            </p>
                          })
                        }}>{item.ip == null ? item.hostname : item.ip}</Tag>
                      </Grid.Col>
                    })
                  }
                </Grid.Row>
              </Card>
            </Grid.Col>
          </Grid.Row>

          {activityTasks.map((activityTask: any) => {
            const {scene} = activityTask
            return <SlidePanel
              key={`${activityTask.id}-${scene.scenarioId}`}
              title={scene.name + "-" + scene.version}
              isShowing={activityTask.id === clickActivityTaskId}
              onMaskClick={() => {
                setAlickActivityTaskId(undefined)
              }}
              hasMask
              width="small"
              onClose={() => {
                setAlickActivityTaskId(undefined)
              }}
            >
              <Form {...formItemLayout}>
                {scene.parameters.map((item: any) => {
                  return (
                    <Form.Item key={item.name} labelAlign={"top"}
                               label={item.name + ":"}>
                      <p style={{backgroundColor: 'rgb(247,247,247)'}}>{item.value ? item.value : "-"}</p>
                    </Form.Item>
                  )
                })}
              </Form>
            </SlidePanel>
          })}
        </Tab.Item>
        <Tab.Item key="log" title="日志">
          <TaskDetailLog taskId={taskId}/>
        </Tab.Item>
        <Tab.Item key="metric" title="监控">
          <TaskDetailMetric taskId={taskId}/>
        </Tab.Item>
      </Tab>
    </Loading>
  )
}

TaskDetail.title = 'menu.experiment.task'
TaskDetail.crumb = [{name: 'menu.experiment', route: '/experiment'}, {name: 'menu.experiment.task'}]

export default TaskDetail
