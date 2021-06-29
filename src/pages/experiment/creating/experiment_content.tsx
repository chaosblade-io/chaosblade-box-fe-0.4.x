import React, {useState} from "react";
import {Button, Card, Form, Grid, Icon, Input, Radio, Range, Select} from "@alicloud/console-components";
import SlidePanel from "@alicloud/console-components-slide-panel";
import ExperimentSceneDialog, {CommonProps, Scene} from "./experiment_scene_dialog"
import {connect} from "umi";
import {LinkButton} from "@alicloud/console-components-actions";
import {showConfirmDialog} from "@alicloud/console-components-confirm";
import {UnControlled as CodeMirror} from "react-codemirror2";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/mode/javascript/javascript.js';

const RadioGroup = Radio.Group

export const normalLineStyle = {
  style: {height: 2, marginTop: 50, backgroundColor: "#ebebeb", textAlign: "center"} as React.CSSProperties,
}

export const LongLineStyle = {
  style: {height: 2, marginTop: 25, backgroundColor: "#ebebeb", textAlign: "center"} as React.CSSProperties,
}

export const longHeadLineStyle = {
  style: {
    height: 25,
    width: 2,
    marginBottom: 25,
    backgroundColor: "#ebebeb",
  } as React.CSSProperties,
}

export const longFootLineStyle = {
  style: {
    marginTop: 25,
    height: 25,
    width: 2,
    float: "right",
    backgroundColor: "#ebebeb",
  } as React.CSSProperties,
}

const lineAddCSS = {
  type: "add",
  style: {position: "relative", top: -9, color: '#0070CC'} as React.CSSProperties,
}

const formItemLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 15},
}

const WrapperOne: React.FC<{
  scene: Scene
  setClickScenarioId: any,
}> = (props: any) => {
  const {scene, setClickScenarioId} = props
  return <>
    <Grid.Col span={"3"}>
      <div {...normalLineStyle} >
        <Icon {...lineAddCSS} size={"xs"} onClick={() => {
          setClickScenarioId(scene.scenarioId)
        }}/>
        <Icon type="caret-right" style={{position: "relative", right: -9, top: -9, color: "#ebebeb", float: "right"}}/>
      </div>
    </Grid.Col>
    <Grid.Col span={"8"} key={scene.scenarioId}>
      <Card {...CommonProps}
            title={scene.original}
            subTitle={scene.version}
            extra={<Icon size="xs" type="success"/>}
            onClick={() => {
              setClickScenarioId(scene.scenarioId)
            }}>
        {scene.name}
      </Card>
    </Grid.Col>
  </>
}

const WrapperTwo: React.FC<{
  scene: Scene,
  setClickScenarioId: any,
}> = (props: any) => {

  const {scene, setClickScenarioId} = props
  return <><Grid.Col span={"6"}/>
    <Grid.Col span={"1"}>
      <div style={{height: 50}}>
        <div {...longFootLineStyle} >
          <Icon type="sort-down"
                style={{position: "relative", right: -9, bottom: -13, color: "#ebebeb", float: "right"}}/>
        </div>
      </div>
    </Grid.Col>
    <Grid.Col span={"11"}>
      <div {...LongLineStyle} >
        <Icon {...lineAddCSS} size={"xs"} onClick={() => {
          setClickScenarioId(scene.scenarioId)
        }}/>
      </div>
    </Grid.Col>
    <Grid.Col span={"1"}>
      <div {...longHeadLineStyle} />
    </Grid.Col>
    <Grid.Col span={"4"}/>

    <Grid.Col span={"3"}/>
    <Grid.Col span={"8"} key={scene.scenarioId}>
      <Card {...CommonProps}
            title={scene.original}
            subTitle={scene.version}
            extra={<Icon size="xs" type="success"/>}
            onClick={() => {
              setClickScenarioId(scene.scenarioId)
            }}>
        {scene.name}
      </Card>
    </Grid.Col>
  </>
}

const ExperimentContent = (props: any) => {

  const {experimentCreate, dispatch} = props
  const {scenarios} = experimentCreate

  const [scenariosDialog, showScenariosDialog] = useState(false)
  const [clickScenarioId, setClickScenarioId] = useState<string>()

  return (
    <div>
      <Button type="secondary" size="small" onClick={() => {
        showScenariosDialog(true)
      }}>添加演练内容</Button>

      <ExperimentSceneDialog scenariosDialog={scenariosDialog} showScenariosDialog={showScenariosDialog}/>

      <div style={{padding: 10, marginTop: 10, backgroundColor: "rgb(247, 247, 247)"}}>
        <Icon type="ashbin" size={"xs"} onClick={() => {
          const payload = {scenarios: []}
          dispatch({
            type: 'experimentCreate/selectScenarios',
            payload,
          });
        }}/>
        <Grid.Row wrap={true}>
          {scenarios.map((scene: Scene, index: number) => {

            if (index !== 0 && index % 2 === 0) {
              return <WrapperTwo key={scene.scenarioId} scene={scene} setClickScenarioId={setClickScenarioId}/>
            } else {
              return <WrapperOne key={scene.scenarioId} scene={scene} setClickScenarioId={setClickScenarioId}/>
            }
          })}
        </Grid.Row>
      </div>

      {scenarios.map((scene: Scene) => {
        return <SlidePanel
          key={scene.scenarioId}
          title={scene.name + "-" + scene.version}
          isShowing={scene.scenarioId === clickScenarioId}
          onMaskClick={() => {
            setClickScenarioId(undefined)
          }}
          hasMask
          width="small"
          onClose={() => {
            setClickScenarioId(undefined)
          }}
        >
          <Form {...formItemLayout}>
            {scene.parameters.map((sceneParam: any) => {
              const {parameterId} = sceneParam
              return <SceneParamComponent key={parameterId} scene={scene} sceneParam={sceneParam} dispatch={dispatch}/>
            })
            }
          </Form>
        </SlidePanel>
      })}
    </div>
  )
}

const SceneParamComponent = (props: any) => {

  const {sceneParam, scene, dispatch} = props
  const {parameterId, name, value, alias, description, required, component} = sceneParam

  const renderParam = () => {
    if (component) {
      const {type, values} = component
      switch (type) {
        case 'select':
          return <Select name={name} value={value} placeholder={name} style={{width: '100%'}}
                         onChange={(value) => {
                           const payload = {
                             scenarioId: scene.scenarioId,
                             parameter: {name: name, value: value}
                           }
                           dispatch({
                             type: 'experimentCreate/fillParameters',
                             payload,
                           });
                         }}
          >
            {values.map((item: any) => {
              const {key, label, value} = item
              return <Select.Option key={key} value={value}>{label}</Select.Option>
            })}
          </Select>
        case 'radio':
          return <RadioGroup name={name} value={value} onChange={(value) => {
            const payload = {
              scenarioId: scene.scenarioId,
              parameter: {name: name, value: value}
            }
            dispatch({
              type: 'experimentCreate/fillParameters',
              payload,
            });
          }}>
            {values.map((item: any) => {
              const {key, label, value} = item
              return <Radio key={key} value={value}>{label}</Radio>
            })}
          </RadioGroup>
        case 'number':
          return <Input htmlType="number" name={name} value={value} placeholder={name}
                        onChange={(value) => {
                          const payload = {
                            scenarioId: scene.scenarioId,
                            parameter: {name: name, value: value}
                          }
                          dispatch({
                            type: 'experimentCreate/fillParameters',
                            payload,
                          });
                        }}
          />
        case 'textArea':
          return <Input.TextArea name={name} value={value} placeholder={name}
                                 onChange={(value) => {
                                   const payload = {
                                     scenarioId: scene.scenarioId,
                                     parameter: {name: name, value: value}
                                   }
                                   dispatch({
                                     type: 'experimentCreate/fillParameters',
                                     payload,
                                   });
                                 }}
          />
        case 'range':
          return <Range value={value} marks={[0, 100]} onChange={(value) => {
            const payload = {
              scenarioId: scene.scenarioId,
              parameter: {name: name, value: value}
            }
            dispatch({
              type: 'experimentCreate/fillParameters',
              payload,
            });
          }}/>
        case 'script':
          return <Input htmlType="text" name={name} value={value} placeholder={name}
                        innerAfter={<LinkButton onClick={() => {
                          showConfirmDialog({
                            title: '脚本',
                            type: 'notice',
                            content: <div style={{minWidth: 550}}><CodeMirror
                              options={{
                                mode: 'javascript',
                                theme: 'material-darker',
                                lineNumbers: true
                              }}
                              value={value}
                              onChange={(editor, data, value) => {
                                const payload = {
                                  scenarioId: scene.scenarioId,
                                  parameter: {name: name, value: value}
                                }
                                dispatch({
                                  type: 'experimentCreate/fillParameters',
                                  payload,
                                });
                              }}/></div>,
                          })
                        }}>展开</LinkButton>}
                        onChange={(value) => {
                          const payload = {
                            scenarioId: scene.scenarioId,
                            parameter: {name: name, value: value}
                          }
                          dispatch({
                            type: 'experimentCreate/fillParameters',
                            payload,
                          });
                        }}
          />
        default :
          return ""
      }
    } else {
      return <Input htmlType="text" name={name} value={value} placeholder={name}
                    onChange={(value) => {
                      const payload = {
                        scenarioId: scene.scenarioId,
                        parameter: {name: name, value: value}
                      }
                      dispatch({
                        type: 'experimentCreate/fillParameters',
                        payload,
                      });
                    }}
      />
    }
  }

  return <Form.Item key={parameterId} help={description} labelAlign={"top"}
                    label={alias + ":"}
                    required={required}>
    {renderParam()}
  </Form.Item>
}


export default connect(
  ({experimentCreate}: any) => ({experimentCreate}),
)(ExperimentContent);

