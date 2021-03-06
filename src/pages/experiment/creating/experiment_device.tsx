import React, {useEffect, useState} from "react";
import {Balloon, Icon, Transfer} from "@alicloud/console-components";
import {LinkButton} from "@alicloud/console-components-actions";
import {connect} from "react-redux";
import {getMachinesForHost, getMachinesForNodePageable, getMachinesForPodPageable} from "@/services/device";
import {max_} from "@/models/experimentCreateModel";

const ExperimentDevice = (props: any) => {

  const {experimentCreate, dispatch} = props
  const {dimension, selectMachines} = experimentCreate

  const [machines, setMachines] = useState<Array<any>>([])

  useEffect(() => {
    switch (dimension) {
      case 'host':
        getMachinesForHost({pageSize: max_, status: 2}).then((data) => {
          setMachines(data.data.map((item: any) => {
            return {
              value: item.machineId,
              label: `${item.ip}-${item.hostname}`
            }
          }))
        })
        break
      case 'node':
        getMachinesForNodePageable({pageSize: max_, status: 2}).then((data) => {
          setMachines(data.data.map((item: any) => {
            return {
              value: item.machineId,
              label: item.nodeName
            }
          }))
        })
        break
      case 'pod':
        getMachinesForPodPageable({pageSize: max_, status: 2}).then((data) => {
          setMachines(data.data.map((item: any) => {
            return {
              value: item.machineId,
              label: item.podName
            }
          }))
        })
        break
      case 'container':
        getMachinesForPodPageable({pageSize: max_, status: 2}).then((data) => {
          let machines: Array<any> = []
          data.data.map((item: any) => {
            item.containers.map((c: any) => {
              machines.push({
                value: item.machineId,
                label: item.podName + "/" + c.containerName,
                containerName: c.containerName
              })
            })
          })
          setMachines(machines)
        })
    }
  }, [dimension])

  return <div>
    <Transfer
      mode="simple"
      showSearch
      onChange={(value: Array<any>, data: Array<any>, extra: any) => {
        const payload = {
          machines: data.map((item: any) => {
            return {machineId: item.value, containerName: item.containerName}
          })
        }
        dispatch({
          type: 'experimentCreate/selectMachines',
          payload,
        });
      }}
      listStyle={{width: '300px', height: '192px'}}
      titles={[<Balloon trigger={<Icon type="help" size={"xs"}/>} triggerType="hover">
        ???????????????: <br/>
        1. ??????<LinkButton Component={"a"} href={"/probe"}>????????????</LinkButton>???????????????????????????????????????????????????<br/>
        2. ??????????????????????????????????????????????????????????????????<br/>
        2. Kubernetes ??????????????????????????????<br/>
      </Balloon>,
        <Icon type="success-filling" size={"xs"}>???????????????</Icon>]}
      dataSource={machines}
      value={selectMachines.map((item: any) => {
        return item.machineId
      })}
    />
  </div>
}

export default connect(
  ({experimentCreate}: any) => ({experimentCreate}),
)(ExperimentDevice);
