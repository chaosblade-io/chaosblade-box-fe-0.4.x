import React, { useEffect, useState } from "react";
import { Chart, LineAdvance } from "bizcharts";
import { Card, Grid } from "@alicloud/console-components";
import { Interval, Tooltip, Legend, View, Axis, Coordinate } from "bizcharts";

import DataSet from "@antv/data-set";

import Table from "@alicloud/console-components-table";
import { Link } from "umi";
import { getExperimentsPageable } from "@/services/experiment";
import { queryTaskStatistics } from "@/services/experimentTask";

const columns = [
  {
    dataIndex: "experimentName",
    title: "演练名称",
    sortable: false,
    cell: (value: string, rowIndex: number, record: any, context: any) => {
      const { experimentId } = record;
      const toURL: string =
        "/experiment/detail?experimentId=" + { experimentId }.experimentId;
      return <Link to={toURL}>{value}</Link>;
    },
  },
  {
    dataIndex: "taskCount",
    title: "执行次数",
    sortable: false,
  },
  {
    dataIndex: "lastTaskResult",
    title: "最后一次演练状态",
    cell: (value: any) => {
      switch (value) {
        case 0:
          return "运行成功";
        case 1:
          return "运行失败";
        case 2:
          return "任务跳过";
        case 3:
          return "任务异常中断";
        case 4:
          return "任务被终止";
        case 5:
          return "停止失败";
      }
      return "未执行";
    },
  },
  {
    dataIndex: "lastTaskStartTime",
    title: "最后一次演练时间",
  },
];

const Index = () => {
  const [dataSource, setDataSource] = useState<Array<[]>>();
  const [visible, setVisible] = useState<boolean>();
  const [taskDataSource, setTaskDataSource] = useState<Array<any>>();

  const getExperiments = (params?: any) => {
    setVisible(true);
    getExperimentsPageable(params)
      .then((data) => {
        setDataSource(data.data);
      })
      .finally(() => {
        setVisible(false);
      });
  };

  useEffect(() => {
    getExperiments({ pageSize: 5 });
  }, []);

  useEffect(() => {
    queryTaskStatistics().then((date) => {
      setTaskDataSource(
        date.map((d: any) => {
          return {
            ...d,
            taskCount: Number(d.taskCount),
          };
        })
      );
    });
  }, []);

  return (
    <>
      <Grid.Row wrap>
        <Grid.Col span={"8"}>
          <Card title={"支持的场景"} contentHeight={200}>
            <Scene />
          </Card>
        </Grid.Col>
        <Grid.Col span={"16"}>
          <Card title={"演练数据"} contentHeight={200}>
            <Chart padding={[10, 20, 50, 40]} autoFit data={taskDataSource}>
              <LineAdvance
                shape="smooth"
                point
                area
                position="date*taskCount"
              />
            </Chart>
          </Card>
        </Grid.Col>
      </Grid.Row>
      <Grid.Row wrap>
        <Grid.Col span={"24"}>
          <Card contentHeight={220} title={"最近演练记录"}>
            <Table
              loading={visible}
              dataSource={dataSource}
              columns={columns}
              primaryKey="id"
            />
          </Card>
        </Grid.Col>
      </Grid.Row>
    </>
  );
};

const Scene = () => {
  const data = [
    { value: 1, type: "OS", name: "CPU" },
    { value: 2, type: "OS", name: "内存" },
    { value: 3, type: "OS", name: "磁盘" },
    { value: 10, type: "OS", name: "网络" },
    { value: 20, type: "Java", name: "延时" },
    { value: 20, type: "Java", name: "异常" },
  ];

  const ds = new DataSet({
    state: {
      // initialize state
      foo: "bar",
    },
  });
  let dv = ds.createView();
  // 通过 DataSet 计算百分比
  dv.source(data).transform({
    type: "percent",
    field: "value",
    dimension: "type",
    as: "percent",
  });

  let dv1 = ds.createView();
  dv1.source(data).transform({
    type: "percent",
    field: "value",
    dimension: "name",
    as: "percent",
  });

  return (
    <Chart
      height={200}
      data={dv.rows}
      autoFit
      scale={{
        percent: {
          formatter: (val: any) => {
            val = (val * 100).toFixed(2) + "%";
            return val;
          },
        },
      }}
    >
      <Coordinate type="theta" radius={0.5} />
      <Axis visible={false} />
      <Legend visible={false} />
      <Tooltip showTitle={false} />
      <Interval
        position="percent"
        adjust="stack"
        color="type"
        element-highlight
        style={{
          lineWidth: 1,
          stroke: "#fff",
        }}
        label={[
          "type",
          {
            offset: -15,
          },
        ]}
      />
      <View data={dv1.rows}>
        <Coordinate type="theta" radius={0.75} innerRadius={0.5 / 0.75} />
        <Interval
          position="percent"
          adjust="stack"
          color={[
            "name",
            ["#BAE7FF", "#7FC9FE", "#71E3E3", "#ABF5F5", "#8EE0A1", "#BAF5C4"],
          ]}
          element-highlight
          style={{
            lineWidth: 1,
            stroke: "#fff",
          }}
          label="name"
        />
      </View>
    </Chart>
  );
};

Index.title = "menu.overview";
export default Index;
