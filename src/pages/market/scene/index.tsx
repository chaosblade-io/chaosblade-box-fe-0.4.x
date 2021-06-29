import React, {useEffect, useState} from 'react'
import {Button, Message, Tab} from '@alicloud/console-components'
import url from "url";
import axios from "axios";
import yaml from "js-yaml";
import Table from "@alicloud/console-components-table";
import {fetchScenes} from "@/services/market";
import MarketList from "@/pages/market";

const MarketSceneList = (props: any) => {

  const name: string = url.parse(props.location.search, true).query.name as string;
  const version: string = url.parse(props.location.search, true).query.version as string;
  const [scenes, setScenes] = useState<Array<String>>([])

  const fetchScenesAsync = async (name: string, version: string) => {
    const result = await fetchScenes(name, version)
    yaml.loadAll(result, (value: any) => {
      setScenes(value.scenarioFiles.map((sceneName: string, index: number) => {
          return <Tab.Item key={index} title={sceneName}>
            {/*<TabHead/>*/}
            <SceneList name={name} version={version} sceneName={sceneName}/>
          </Tab.Item>
        }
      ))
    })
  }

  useEffect(() => {
    fetchScenesAsync(name, version);
  }, [])

  return (<div>
    <Tab defaultActiveKey={0}>
      {scenes}
    </Tab>
  </div>)
}

const TabHead = () => {

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  return <div style={{marginTop: 5, marginBottom: 5}}>
    <Message visible={visible} closeable onClose={
      () => {
        setVisible(false)
      }
    }>
      已导入10个场景
    </Message>

    <Button style={{marginTop: 5, marginBottom: 5}} type={"primary"} loading={loading} onClick={() => {
      setVisible(true)
      axios.post("/api/importScenarios", () => {

      })
    }
    }>导入场景</Button>
  </div>
}

const columns = [
  {
    dataIndex: 'name',
    title: '场景名称',
  },
  {
    dataIndex: 'desc',
    title: '描述',
  },
  {
    dataIndex: 'categories',
    title: '所属类目',
  }
]

interface State {
  dataSource: Array<[]>,
  visible: boolean,
  page: number,
  pageSize: number,
  total: number,
}

const SceneList = (props: any) => {

  const {name, version, sceneName, scenesList} = props

  const [dataSource, setDataSource] = useState<Array<any>>()
  const [total, setTotal] = useState<number>()
  const [page, setPage] = useState<number>()
  const [pageSize, setPageSize] = useState<number>()

  useEffect(() => {
    axios.get("/api/FetchChaostoolsScenarios/" + name + "/" + version + "/" + sceneName)
      .then(function (response) {

        const {data} = response

        let scenes: Array<any> = []
        yaml.loadAll(data, (value: any) => {
          value.items.map((item: any) => {

            item.actions.map((action: any) => (
              scenes.push({
                name: name + "." + item.target + "." + action.action,
                desc: action.longDesc
              })))

          })
        });
        setDataSource(scenes)
        setTotal(scenes.length)
        setPage(1)
        setPageSize(scenes.length)


      }).catch(function (error) {
      Message.error(error)
    })
  }, [])

  return <div style={{marginTop: '16px'}}>
    <Table
      dataSource={dataSource}
      columns={columns}
      primaryKey=" id"
    />
  </div>
}

MarketSceneList.title = 'menu.chaostools.detail'
MarketSceneList.crumb = [{name: 'menu.chaostools.market', route: '/market'}, {name: 'menu.chaostools.detail'}]

export default MarketSceneList
