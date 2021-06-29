import {Message} from "@alicloud/console-components";
import copy from "copy-to-clipboard";
import React from "react";

const ManualInstall = () => {

  const command = "wget https://chaosblade.oss-cn-hangzhou.aliyuncs.com/platform/chaosagentctl.sh -O chaosagentctl.sh &&" +
    "chmod +x chaosagentctl.sh && ./chaosagentctl.sh install -r" +
    "https://chaosblade.oss-cn-hangzhou.aliyuncs.com/platform/chaosagent -t 服务端地址:服务端口号"

  return (
    <div>
      <div style={{marginTop: 10, marginBottom: 10}}>请复制并替换 服务端地址、服务端口号，在目标实验目标服务上执行一下命令。</div>
      <Message type={"help"} style={{cursor: "pointer"}} iconType={"copy"} onClick={() => {
        copy(command)
        Message.success("已复制")
      }}>
        {command}
      </Message>
    </div>
  )
}

export default ManualInstall
