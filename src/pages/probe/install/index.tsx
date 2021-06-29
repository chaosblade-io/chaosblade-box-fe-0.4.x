import React, {useEffect, useState} from 'react'
import {Card, Grid, Step} from '@alicloud/console-components'
import ansible from '../../../images/ansible.svg'
import ssh from '../../../images/ssh.svg'
import command from '../../../images/command-line.svg'
import kubernetes from '../../../images/kubernetes.svg'
import AnsibleInstall from "@/pages/probe/install/ansible";
import ManualInstall from "@/pages/probe/install/manual";
import ProbeK8SList from "@/pages/probe/install/helm";
import ProbeSSHList from "@/pages/probe/install/ssh";

const steps = [
  '选择方式',
  '安装探针',
  '查看数据',
].map((item, index) => <Step.Item key={index} title={item}/>)

const cardStyle = {
  style: {cursor: "pointer", textAlign: 'center', marginLeft: 5} as React.CSSProperties
}

const StepOne = () => {

  const [content, setContent] = useState<React.ReactNode>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    setContent(<InstallMode setContent={setContent} setCurrent={setCurrent}/>)
  }, [])

  return (
    <div>
      <Step current={current} shape="arrow">
        {steps}
      </Step>
      <div>
        {content}
      </div>
    </div>
  )
}

const InstallMode = (props: any) => {

  const {setContent} = props
  const {setCurrent} = props

  return <Grid.Row wrap style={{marginTop: 10}}>
    <Grid.Col span={"6"}>
      <Card {...cardStyle} title="Ansible">
        <div onClick={
          () => {
            setContent(<AnsibleInstall/>)
            setCurrent(1)
          }
        }><img src={ansible} alt={''}/></div>
      </Card>
    </Grid.Col>

    <Grid.Col span={"6"}>
      <Card {...cardStyle} title="手动安装">
        <div onClick={() => {
          setContent(<ManualInstall/>)
          setCurrent(1)
        }}><img src={command} alt={''}/></div>
      </Card>
    </Grid.Col>

    <Grid.Col span={"6"}>
      <Card {...cardStyle} title="SSH">
        <div onClick={() => {
          setContent(<ProbeSSHList/>)
          setCurrent(1)
        }}><img src={ssh} alt={''}/></div>
      </Card>
    </Grid.Col>

    <Grid.Col span={"6"}>
      <Card {...cardStyle} title="kubernetes">
        <div onClick={() => {
          setContent(<ProbeK8SList/>)
          setCurrent(1)
        }}><img src={kubernetes} alt={''}/></div>
      </Card>
    </Grid.Col>
  </Grid.Row>
}

StepOne.title = 'menu.machine.register'
StepOne.crumb = [{name: 'menu.machine.probe', route: '/probe'}, {name: 'menu.machine.register'}]

export default StepOne
