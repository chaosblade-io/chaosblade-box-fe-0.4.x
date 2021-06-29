import React, {useEffect, useState} from 'react'
import {Button, Card, Grid, Icon} from '@alicloud/console-components'
import Actions, {LinkButton} from '@alicloud/console-components-actions'
import {Link} from 'umi';
import Table from '@alicloud/console-components-table'
import {CommonProps} from "./creating/experiment_scene_dialog";
import {getExperimentsPageable, getExperimentTotalStatistics, startExperiment} from '@/services/experiment';
import {useHistory} from "react-router-dom";

const ExperimentList = () => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState<number>(0)
  const [statistics, setStatistics] = useState<any>(0)

  const getExperiments = (params?: any) => {
    setVisible(true)
    getExperimentsPageable(params).then((data) => {
      setDataSource(data.data)
      setTotal(Number(data.total))
      setPage(data.page)
      setPageSize(data.pageSize)
    }).finally(() => {
      setVisible(false)
    })
  }

  let history = useHistory();

  useEffect(() => {
    getExperiments()
    getExperimentTotalStatistics().then((data) => {
      setStatistics(data)
    })
  }, [])

  return <>
    <Grid.Row>
      <Grid.Col span={"4"}>
        <Card {...CommonProps} title={"未执行"}>
          <h2>{statistics.prepares}</h2>
        </Card>
      </Grid.Col>

      <Grid.Col span={"4"}>
        <Card {...CommonProps} title={"已完成"}>
          <h2>{statistics.finished}</h2>
        </Card>
      </Grid.Col>

      <Grid.Col span={"4"}>
        <Card {...CommonProps} title={"运行中"}>
          <h2>{statistics.running}</h2>
        </Card>
      </Grid.Col>

      <Grid.Col span={"4"}>
        <Card {...CommonProps} title={"失败"}>
          <h2>{statistics.failed}</h2>
        </Card>
      </Grid.Col>

      <Grid.Col span={"4"}>
        <Card {...CommonProps} title={"成功"}>
          <h2>{statistics.success}</h2>
        </Card>
      </Grid.Col>

      <Grid.Col span={"4"}>
        <Card {...CommonProps} title={"总计"}>
          <h2>{statistics.totals}</h2>
        </Card>
      </Grid.Col>
    </Grid.Row>
    <div style={{marginTop: 10}}>
      <Table
        loading={visible}
        dataSource={dataSource}
        primaryKey="id"
        operation={<Link to='/experiment/creating'><Button type="primary">创建演练</Button></Link>}
        search={{
          placeholder: '演练名称',
          filter: [
            {
              value: '1',
              label: '全部',
            },
            {
              value: '2',
              label: '运行中',
            },
            {
              value: '3',
              label: '运行成功',
            },
            {
              value: '4',
              label: '运行失败',
            },
            {
              value: '5',
              label: '未执行',
            },
            {
              value: '6',
              label: '已完成',
            },
          ],
          onSearch: ((value: string, filterValue?: any) => {
            getExperiments({
              "experimentName": value,
              "status": filterValue
            })
          })
        }}
        pagination={{
          popupProps: {
            align: "bl tl"
          },
          current: page,
          pageSize: pageSize,
          total: total,
          onPageSizeChange: (pageSize: number) => {
            getExperiments({
              "page": 1,
              "pageSize": pageSize
            })
          },
          onChange: (current: number, e: Object) => {
            getExperiments({
              "page": current,
              "pageSize": pageSize
            })
          },
        }}
      >
        <Table.Column dataIndex={'experimentName'} title={'演练名称'} cell={
          (value: string, rowIndex: number, record: any, context: any) => {
            const {experimentId} = record
            const toURL: string = "/experiment/detail?experimentId=" + {experimentId}.experimentId
            return <Link to={toURL}>{value}</Link>
          }
        }/>
        <Table.Column dataIndex={'taskCount'} title={'执行次数'}/>
        <Table.Column dataIndex={'lastTaskResult'} title={'最后一次演练状态'} cell={
          (value: string, rowIndex: number, record: any, context: any) => {
            const {lastTaskResult, lastTaskStatus, lastTaskId} = record
            if (lastTaskId === null) {
              return '未执行'
            }
            if (lastTaskStatus < 4) {
              return <><Icon size={"xs"} type="loading"/>
                <LinkButton onClick={() => {
                  history.push(`/experiment/task/detail?taskId=${lastTaskId}`);
                }}>
                  运行中
                </LinkButton></>
            }
            if (lastTaskStatus == 4) {
              return '已完成'
            }
            if (lastTaskResult === 0) {
              return '运行成功'
            }
            if (lastTaskResult === 1) {
              return '运行失败'
            }
          }
        }/>
        <Table.Column dataIndex={'lastTaskStartTime'} title={'最后一次演练时间'}/>
        <Table.Column title={'操作'} cell={
          (value: string, rowIndex: number, record: any, context: any) => {
            const {experimentId} = record
            return <Actions>
              <LinkButton
                onClick={() => {
                  startExperiment(experimentId).then((result) => {
                    if (result) {
                      history.push(`/experiment/task/detail?taskId=${result.taskId}`);
                    }
                  })
                }}>
                执行
              </LinkButton>
            </Actions>
          }
        }/>
      </Table>
    </div>
  </>
}

ExperimentList.title = 'menu.experiment'
ExperimentList.crumb = [{name: 'menu.experiment'}]

export default ExperimentList
