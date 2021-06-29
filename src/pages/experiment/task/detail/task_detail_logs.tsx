import React, {useEffect, useState} from 'react'
import {Timeline, Message} from '@alicloud/console-components'
import AnsiUp from 'ansi_up'
import axios from "axios";

const {Item: TimelineItem} = Timeline

const ansiUp = new AnsiUp();

const TaskDetailLog: React.FC<{ taskId: string }> = (props: any) => {

    const [logs, setLogs] = useState<Array<string>>([])

    useEffect(() => {
        const interval = setInterval(() => {
            axios.post("/api/QueryTaskLog", {taskId: props.taskId})
                .then((response) => {
                    const {data} = response
                    setLogs(data.data)
                }).catch((e) => {
                Message.error(e)
            })

        }, 2000);

        return () => {
            clearInterval(interval)
        }
    }, [])

    return (<div style={{margin: 5, overflowX: 'auto'}}>
        <Timeline style={{marginLeft: 5}}>
            {logs.map((item: string, index: number) => {
                return (<TimelineItem animation key={index}
                                      content={<div dangerouslySetInnerHTML={{__html: ansiUp.ansi_to_html(item)}}/>}/>)
            })}
            <TimelineItem icon={'loading'} state={'process'}/>
        </Timeline>
    </div>)
}

export default TaskDetailLog
