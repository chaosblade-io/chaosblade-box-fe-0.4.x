import React, {Fragment, useEffect, useState} from 'react'
import '@alicloud/console-components/dist/wind.css'
import {Icon} from '@alicloud/console-components'
import DataFields, {IDataFieldsProps} from '@alicloud/console-components-data-fields'
import axios from "axios";
import yaml from "js-yaml";
import Actions, {LinkButton} from "@alicloud/console-components-actions";
import AnsibleInstall from "@/pages/probe/install/ansible";

const items: IDataFieldsProps['items'] = [
  {
    dataIndex: 'name',
    render: val => <h1>{val}</h1>,
    span: 24,
  },
  {
    dataIndex: 'latest',
    label: '最新版本',
  },
  {
    dataIndex: 'license',
    label: '协议类型',
    render: val => (
      <Fragment>
        <span style={{fontStyle: 'italic', fontWeight: 600}}>{val}</span>
        <Icon type="help" size="xs" style={{marginLeft: '16px'}}/>
      </Fragment>
    ),
  },
  {
    dataIndex: 'subTitle',
    label: '描述',
    span: 24,
  },
  {
    dataIndex: 'description',
    label: '描述',
    span: 24,
  },
  {
    label: '相关地址',
    render: (val, {webSite, npm}) => (
      <Fragment>
        {webSite && <a href={webSite}>webSite</a>}
      </Fragment>
    ),
    style: {
      lineHeight: '24px',
    },
  },
  {
    dataIndex: 'readme',
    label: 'readme',
    render: val => <code style={{fontSize: 16}}>{val}</code>,
    span: 24,
    style: {
      lineHeight: '24px',
    },
  },
]

const MarketList = () => {

  const [chaosTools, setChaosTools] = useState<Array<IDataFieldsProps['dataSource']>>([])

  useEffect(() => {
    axios.get('/api/FetchPublicChaostools')
      .then(function (response) {
        const {data} = response

        let iterator = (tools: any) => {
          let pro: Array<Promise<any>> = tools.publics.map((tool: string) => {
            return axios.get('/api/FetchChaostoolsOverview/' + tool + '/overview.yaml')
              .then((response) => {
                const {data} = response

                let chaosTools: IDataFieldsProps['dataSource'] = {};
                yaml.loadAll(data, (value: any) => {
                  chaosTools = {
                    name: value.name,
                    latest: value.latest,
                    copyright: value.copyright,
                    license: 'Apache',
                    subTitle: value.subTitle,
                    description: value.description,
                    webSite: value.webSite,
                    readme: value.readme,
                  }
                });
                return chaosTools;
              })
          });
          Promise.all(pro).then((value) => {
            setChaosTools(value)
          })
        };

        yaml.loadAll(data, iterator);
      }).catch(function (error) {
      console.log(error);
    })

  }, [])

  return (
    <>
      {
        chaosTools.map((dataSource: IDataFieldsProps['dataSource'], index) => {
          return (
            <div key={dataSource.name}>
              <DataFields dataSource={dataSource} items={items}/>

              <Actions>
                <LinkButton Component={"a"}
                            href={`/market/scene?name=${dataSource.name}&version=${dataSource.latest}`}
                >
                  场景管理
                </LinkButton>
                <LinkButton Component={"a"}
                            href={`/tools?name=${dataSource.name}&version=${dataSource.latest}`}
                >
                  工具管理
                </LinkButton>
              </Actions>
              <hr/>
            </div>
          )
        })
      }
    </>
  )
}

MarketList.title = 'menu.chaostools.market'
MarketList.crumb = [{name: 'menu.chaostools.market'}]

export default MarketList
