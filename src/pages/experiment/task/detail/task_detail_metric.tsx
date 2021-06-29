import React, {useEffect, useState} from 'react';
import {Chart, LineAdvance, Axis} from 'bizcharts';
import {Card, Grid, Icon, Dropdown, Menu, Dialog, Form} from '@alicloud/console-components'
import {queryTaskMonitor} from "@/services/metric";
import {showConfirmDialog} from "@alicloud/console-components-confirm";

interface Metrics {
  name: string
  date: Array<Data>
  code: string
  params: any
}

interface Data {
  date: string
  value: number,
  metric: string
}

const TaskDetailMetric: React.FC<{ taskId: string }> = (props: any) => {

  const {taskId} = props
  const [metrics, setMetrics] = useState<Array<Metrics>>([]);

  const queryTaskMonitor_ = async (params?: any) => {

    const result = await queryTaskMonitor(params)

    let metricArray: Array<Metrics> = []
    result.map((metric: any) => {
      let dataArray: Array<Data> = []
      metricArray.push({
        name: metric.name,
        date: dataArray,
        code: metric.code,
        params: metric.params
      })
      const {metricTask} = metric
      metricTask.map((m: any) => {
        const {metric, metrics} = m
        metrics.map((data: any) => {
          const {date, value} = data
          dataArray.push({
            date: date + " ",
            value: Number(value),
            metric: metric
          })
        });
      })
    })
    return metricArray;
  }

  useEffect(() => {
    queryTaskMonitor_({taskId: taskId}).then((metricArray) => {
      setMetrics(metricArray)
    })

    let interval = setInterval(() => {
      queryTaskMonitor_({taskId: taskId}).then((metricArray) => {
        setMetrics(metricArray)
      })
    }, 2000);

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      <Grid.Row style={{padding: 5}}>
        {/*<Button size={"small"}>添加监控面板</Button>*/}
      </Grid.Row>
      <Grid.Row wrap>
        <Grid.Col span={"24"}>
          {
            metrics.map((metric: any) => {
              return <Charts key={metric.name} metric={metric} />
            })
          }
        </Grid.Col>

      </Grid.Row>
    </>
  )
}

const Charts = (props: any) => {


  const {metric} = props

  return <Card title={metric.name}
        extra={<Dropdown trigger={<Icon size="xs" type="ellipsis-vertical"/>} triggerType="click">
          <Menu>
            {/*<Menu.Item onClick={() => {*/}
            {/*  setDialogVisit(true)*/}
            {/*}}>编辑</Menu.Item>*/}
            <Menu.Item onClick={() => {
              showConfirmDialog({
                type: 'notice',
                title: `${metric.name}`,
                content: <p><Form style={{width: 450}}
                                  labelCol={{span: 6}}
                                  wrapperCol={{span: 14}}>
                  <Form.Item label="CODE: ">
                    <p className="next-form-text-align">
                      {metric.code}
                    </p>
                  </Form.Item>
                  {metric.params.map((item: any) => {
                    return <Form.Item label={`${item.name}:`}>
                      <p className="next-form-text-align">
                        {item.value}
                      </p>
                    </Form.Item>
                  })}
                </Form>
                </p>,
              })
            }}>详情</Menu.Item>
          </Menu>
        </Dropdown>}>

    <Chart autoFit height={500} data={metric.date}>
      <Axis name="date"/>

      <LineAdvance
        shape="smooth"
        point
        area
        color="metric"
        position="date*value"
      />
    </Chart>
  </Card>
}

const DialogEdit = (props: any) => {
  const {dialogVisit, setDialogVisit} = props
  return <Dialog title="编辑 Metric"
                 visible={dialogVisit}
                 onOk={() => {
                   setDialogVisit(false)
                 }}
                 onCancel={() => {
                   setDialogVisit(false)
                 }}
                 onClose={() => {
                   setDialogVisit(false)
                 }}>
    Start your business here by searching a popular product
  </Dialog>
}

export default TaskDetailMetric

