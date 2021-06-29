import React, {useEffect, useState} from "react";
import {Card, Dialog, Grid, Icon, Loading, Search} from "@alicloud/console-components";
import Page from '@alicloud/console-components-page'
import {connect} from "react-redux";
import {getScenarioCategories, getScenariosPageable} from "@/services/scenarios";

const {Menu} = Page

export const CommonProps = {
  style: {
    height: 120,
    margin: 5,
  } as React.CSSProperties,
}

export interface Scene {
  scenarioId: string,
  original: string,
  name: string,
  version: string
  parameters?: any
}

const selectedScenes: Array<Scene> = new Array<Scene>()

const ExperimentSceneDialog = (props: any) => {
  const {dispatch, experimentCreate} = props
  const {dimension} = experimentCreate

  const [scenesList, setScenesList] = useState<Array<React.ReactNode>>([])
  const [loading, setLoading] = useState<boolean>(false)

  const {scenariosDialog, showScenariosDialog} = props

  const onMenuItemClick = (categoryId: number) => {
    setLoading(true)
    getScenariosPageable({
      pageSize: 5000,
      scopeType: dimension,
      categoryId: categoryId
    }).then(function (data) {
      setScenesList(data.data.map((item: any, i: number) => (
        <ExperimentSceneList key={item.scenarioId} scene={item}/>
      )));
    }).finally(() => {
      setLoading(false)
    })
  }

  return (
    <Dialog title="请选择场景"
            visible={scenariosDialog}
            onOk={() => {
              const payload = {scenarios: selectedScenes}
              dispatch({
                type: 'experimentCreate/selectScenarios',
                payload,
              });
              selectedScenes.length = 0
              setScenesList([])
              showScenariosDialog(false)
            }}
            onClose={() => {
              showScenariosDialog(false)
              setScenesList([])
              selectedScenes.length = 0
            }}
            onCancel={() => {
              showScenariosDialog(false)
              setScenesList([])
              selectedScenes.length = 0
            }}>
      <Page style={{width: 920, height: 600}}>
        <Page.Header>
          <Search key="2" shape="simple" onSearch={() => {

          }} style={{width: '888px'}}/>
        </Page.Header>
        <Loading visible={loading} fullScreen>
          <Page.Content menu={<ExperimentSceneCategory click={onMenuItemClick} dimension={dimension}/>}>
            <Grid.Row wrap>
              {scenesList}
            </Grid.Row>
          </Page.Content>
        </Loading>
      </Page>
    </Dialog>
  )
}

const ExperimentSceneCategory: React.FC<{ click: any, dimension: string }> = (props) => {

  const [category, setCategory] = useState([])
  const {dimension} = props

  useEffect(() => {

    getScenarioCategories({scopeType: dimension}).then(function (data) {
      setCategory(data.map((item: any) => (
        <Menu.SubMenu key={item.categoryId} label={item.name}>
          {item.children.map((item: any) => (
            <Menu.Item key={item.categoryId} onClick={() => props.click(item.categoryId)}>
              {item.name}
            </Menu.Item>))}
        </Menu.SubMenu>
      )))
    })
  }, [])

  return (
    <Menu>{category}</Menu>
  )
}

const ExperimentSceneList: React.FC<{
  scene: Scene
}> = ({scene}) => {

  const [extra, setExtra] = useState<React.ReactNode>(null)
  return (
    <Grid.Col span={"8"}>
      <Card {...CommonProps} title={scene.original} subTitle={scene.version} onClick={() => {
        if (extra == null) {
          setExtra(<Icon size="xs" type="success"/>)
          selectedScenes.push(scene)
        } else {
          setExtra(null)
          let index = selectedScenes.findIndex(item => item.scenarioId === scene.scenarioId);
          selectedScenes.splice(index, 1)
        }
      }} extra={extra}>
        {scene.name}
      </Card>
    </Grid.Col>
  )
}

export default connect(
  ({experimentCreate}: any) => ({experimentCreate}),
)(ExperimentSceneDialog);

