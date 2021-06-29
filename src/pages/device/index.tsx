import React, {useEffect, useState} from 'react'
import {Card, Grid, Tab} from '@alicloud/console-components'
import HostTab from "./host_list";
import NodeTab from "./node_list";
import PodTab from "./pod_list";
import {CommonProps} from "../experiment/creating/experiment_scene_dialog";
import {getHostTotalStatistics, getK8sResourceStatistics} from "@/services/device";

const Device = () => {

  const [namespaces, setNamespaces] = useState<number>(0)
  const [nodes, setNodes] = useState<number>(0)
  const [pods, setPods] = useState<number>(0)
  const [containers, setContainers] = useState<number>(0)
  const [totals, setTotals] = useState<number>(0)
  const [onlines, setOnlines] = useState<number>(0)

  useEffect(() => {
    getHostTotalStatistics().then((data) => {
      setTotals(data.totals)
      setOnlines(data.onlines)
    })

    getK8sResourceStatistics().then((data) => {
      setNamespaces(data.namespaces)
      setNodes(data.nodes)
      setPods(data.pods)
      setContainers(data.containers)
    })
  }, [])

  return (
    <>
      <Grid.Row>
        <Grid.Col span={"4"}>
          <Card {...CommonProps} title={"主机"}>
            <h2>{totals}</h2>
          </Card>
        </Grid.Col>

        <Grid.Col span={"4"}>
          <Card {...CommonProps} title={"在线主机"}>
            <h2>{onlines}</h2>
          </Card>
        </Grid.Col>

        <Grid.Col span={"4"}>
          <Card {...CommonProps} title={"Namespaces"}>
            <h2>{namespaces}</h2>
          </Card>
        </Grid.Col>

        <Grid.Col span={"4"}>
          <Card {...CommonProps} title={"Node"}>
            <h2>{nodes}</h2>
          </Card>
        </Grid.Col>

        <Grid.Col span={"4"}>
          <Card {...CommonProps} title={"Pod"}>
            <h2>{pods}</h2>
          </Card>
        </Grid.Col>

        <Grid.Col span={"4"}>
          <Card {...CommonProps} title={"Container"}>
            <h2>{containers}</h2>
          </Card>
        </Grid.Col>

      </Grid.Row>
      <Tab>
        <Tab.Item key="host" title="主机">
          <HostTab/>
        </Tab.Item>
        <Tab.Item key="node" title="节点">
          <NodeTab/>
        </Tab.Item>
        <Tab.Item key="pod" title="Pod">
          <PodTab/>
        </Tab.Item>
      </Tab>
    </>
  )
}

Device.title = 'menu.machine.list'
Device.crumb = [{name: 'menu.machine.list'}]

export default Device
