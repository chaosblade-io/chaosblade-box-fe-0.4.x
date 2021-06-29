import React from "react";
import Table from '@alicloud/console-components-table'

const columns = [
  {
    dataIndex: 'identity',
    title: 'Identity'
  },
  {
    dataIndex: 'machineType',
    title: '机器类型',
    cell: (value: any) => {
      switch (value) {
        case '0':
          return '主机'
        case '1':
          return '节点'
        case '2':
          return 'Pod'
      }
    }
  },
  {
    dataIndex: 'ip',
    title: 'IP 地址',
  }
]

export default class ExperimentDevice extends React.Component<any, any> {

  render() {
    const {machines} = this.props

    return <div style={{marginTop: '16px'}}>
      <Table
        dataSource={machines}
        columns={columns}
        primaryKey="id"
      />
    </div>
  }
}
