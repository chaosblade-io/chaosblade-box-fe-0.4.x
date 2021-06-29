import React from "react";
import Table from '@alicloud/console-components-table'

const columns = [
    {
        dataIndex: 'name',
        title: '名称',
        sortable: true,
    },
    {
        dataIndex: 'code',
        title: 'CODE 码',
    },
    {
        dataIndex: 'params',
        title: '参数',
        cell: (value: any) => {
            return JSON.stringify(value)
        }
    }
]

export default class ExperimentMetric extends React.Component<any, any> {

    render() {
        const {metrics} = this.props

        return <div style={{marginTop: '16px'}}>
            <Table
                dataSource={metrics}
                columns={columns}
                primaryKey="id"
            />
        </div>
    }
}
