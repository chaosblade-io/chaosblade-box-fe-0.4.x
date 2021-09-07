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
                                value: item.machineId + "/" + c.containerName,
                                label: item.podName + "/" + c.containerName,
                                machineId: item.machineId,
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
                        return {machineId: item.machineId, containerName: item.containerName}
                    })
                }
                dispatch({
                    type: 'experimentCreate/selectMachines',
                    payload,
                });
            }}
            listStyle={{width: '300px', height: '192px'}}
            titles={[<Balloon trigger={<Icon type="help" size={"xs"}/>} triggerType="hover">
                找不到机器: <br/>
                1. 前往<LinkButton Component={"a"} href={"/probe"}>探针管理</LinkButton>，确认机器的故障演练探针运行正常。<br/>
                2. 如果探针安装失败或者已失效，请重新安装探针。<br/>
                2. Kubernetes 请确保开启数据采集。<br/>
            </Balloon>,
                <Icon type="success-filling" size={"xs"}>已选择机器</Icon>]}
            dataSource={machines}
            value={selectMachines.map((item: any) => {
                const {containerName} = item;
                if (containerName) {
                    return item.machineId + "/" + containerName
                }
                return item.machineId
            })}
        />
    </div>
}

export default connect(
    ({experimentCreate}: any) => ({experimentCreate}),
)(ExperimentDevice);
