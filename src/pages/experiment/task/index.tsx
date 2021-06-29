import React, {useEffect, useState} from "react";
import Table from '@alicloud/console-components-table'
import {Link} from "umi";
import {getTasksByExperimentId} from "@/services/experimentTask";

const columns = [
  {
    dataIndex: 'taskName',
    title: '任务名称',
    sortable: false,
    cell: (value: string, rowIndex: number, record: any, context: any) => {
      const {taskId} = record
      const toURL: string = `/experiment/task/detail?taskId=${{taskId}.taskId}`
      return <Link to={toURL}>{value}</Link>
    }
  },
  {
    dataIndex: 'startTime',
    title: '开始时间',
  },
  {
    dataIndex: 'endTime',
    title: '结束时间',
  },
  {
    dataIndex: 'status',
    title: '状态',
    cell: (value: any) => {
      switch (value) {
        case 0:
          return '准备运行'
        case 1:
          return '运行中'
        case 2:
          return '暂停'
        case 3:
          return '停止当中'
        case 4:
          return '已经结束'
      }
      return 0
    }
  },
  {
    dataIndex: 'resultStatus',
    title: '结果',
    cell: (value: any) => {
      switch (value) {
        case 0:
          return '运行成功'
        case 1:
          return '运行失败'
        case 2:
          return '任务跳过'
        case 3:
          return '任务异常中断'
        case 4:
          return '任务被终止'
        case 5:
          return '停止失败'
      }
      return 0
    }
  }
]

const TaskTab = (props: any) => {

  const [dataSource, setDataSource] = useState<Array<[]>>()
  const [visible, setVisible] = useState(true)

  const {experimentId} = props

  const getTasks = (params?: any) => {
    setVisible(true)
    getTasksByExperimentId(params).then((data) => {
      setDataSource(data)
    }).finally(() => {
      setVisible(false)
    })
  }

  useEffect(() => {
    getTasks({experimentId: experimentId})
  }, [])

  return <div style={{marginTop: '16px'}}>
    <Table
      loading={visible}
      dataSource={dataSource}
      columns={columns}
      primaryKey="id"
      search={{
        placeholder: '请输入name进行搜索',
        filter: [
          {
            value: '2',
            label: '成功',
          },
          {
            value: '3',
            label: '失败',
          },
        ],
        onSearch: ((value: string, filterValue?: any) => {
          getTasks({
            experimentId: experimentId,
            "pod": value,
            "status": filterValue
          })
        })
      }}
    />
  </div>
}

TaskTab.title = 'menu.experiment.task'
TaskTab.crumb = [{name: 'menu.experiment', route: '/experiment'}, {name: 'menu.experiment.task'}]

export default TaskTab
