import React from "react";
import {Tab} from "@alicloud/console-components";
import ToolsHostList from "@/pages/tools/host";
import ToolsK8sList from "@/pages/tools/k8s";

const Tools = () => {
  return <Tab>
    <Tab.Item key="host" title="主机">
      <ToolsHostList/>
    </Tab.Item>
    <Tab.Item key="k8s" title="集群">
      <ToolsK8sList/>
    </Tab.Item>
  </Tab>
}

Tools.title = 'menu.chaostools.deployed'
Tools.crumb = [{name: 'menu.chaostools.market', route: '/market'}, {name: 'menu.chaostools.deployed'}]

export default Tools
