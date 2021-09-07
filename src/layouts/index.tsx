import {IRouteComponentProps, Link} from 'umi'
import AppLayout from "@alicloud/console-components-app-layout";
import Page, {Breadcrumb} from "@alicloud/console-components-page";
import React, {ReactNode, useEffect, useState} from "react";
import ConsoleMenu from "@alicloud/console-components-console-menu";
import {useIntl} from "react-intl";
import {setI18n, systemInfo} from "@/services/system";
import {setLocale} from "@@/plugin-locale/localeExports";
import Logo from "@/images/chaosblade-logo.png";
import {Button, Dropdown, Menu} from "@alicloud/console-components";

export const Topbar = (props: any) => {

  const intl = useIntl();

  return (
    <div style={{
      boxShadow: 'rgb(0 0 0 / 8%) 0px 1px 4px 0px',
      height: 50,
      padding: 10,
    }}>
      <img src={Logo} height={30}/>

      <div style={{float: "right"}}>
        <Dropdown trigger={<Button type={"secondary"} text>{intl.formatMessage({
          id: "locale",
          defaultMessage: "🇨🇳 简体中文"
        })}</Button>}>
          <Menu>
            <Menu.Item onClick={() => {
              setLocale('zh-CN', false);
              setI18n({locale: 'zh-CN'}).then(r => {})
            }}>🇨🇳 简体中文</Menu.Item>
            <Menu.Item onClick={() => {
              setLocale('en-US', false);
              setI18n({locale: 'en-US'}).then(r => {})
            }}>🇺🇸 English</Menu.Item>
          </Menu>
        </Dropdown>
      </div>
    </div>
  )
}

const Nav = (props: any) => {

  const {version} = props
  const intl = useIntl();

  return <ConsoleMenu header={`ChaosBlade-Box-${version}`}>
    <ConsoleMenu.Item key="overview">
      <Link to="/"> {intl.formatMessage({id: "menu.overview", defaultMessage: "概览"})} </Link>
    </ConsoleMenu.Item>
    <ConsoleMenu.Item key="instance">
      <Link to="/device"> {intl.formatMessage({id: "menu.machine.list", defaultMessage: "机器列表"})} </Link>
    </ConsoleMenu.Item>
    <ConsoleMenu.Item key="experiment">
      <Link to="/experiment"> {intl.formatMessage({id: "menu.experiment", defaultMessage: "故障演练"})} </Link>
    </ConsoleMenu.Item>
    <ConsoleMenu.SubMenu key="log" label={intl.formatMessage({id: "menu.scenario", defaultMessage: "场景管理"})}>
      <ConsoleMenu.Item key="access-log">
        <Link to="/scene/category"> {intl.formatMessage({id: "menu.scenario.category", defaultMessage: "场景目录"})} </Link>
      </ConsoleMenu.Item>
      <ConsoleMenu.Item key="load-log">
        <Link to="/scene/list"> {intl.formatMessage({id: "menu.scenario.list", defaultMessage: "场景列表"})} </Link>
      </ConsoleMenu.Item>
    </ConsoleMenu.SubMenu>

    <ConsoleMenu.Item key="probe">
      <Link to="/probe"> {intl.formatMessage({id: "menu.machine.probe", defaultMessage: "探针管理"})} </Link>
    </ConsoleMenu.Item>
    <ConsoleMenu.Item key="market">
      <Link to="/market"> {intl.formatMessage({id: "menu.chaostools.market", defaultMessage: "工具市场"})} </Link>
    </ConsoleMenu.Item>
    {/*<ConsoleMenu.Item key="api-docs">API 文档</ConsoleMenu.Item>*/}
  </ConsoleMenu>
}

export default function Layout({children, location, route, history, match}: IRouteComponentProps) {

  const [breadcrumb, setBreadcrumb] = useState<ReactNode>()
  const [version, setVersion] = useState<string>('0.4.2');

  const {pathname} = location

  let crumb: Array<string>;
  const getRoute = (route: any, pathname: string) => {
    const {path} = route
    if (path === pathname) {
      crumb = route.crumb
    } else {
      const {routes} = route
      if (routes) {
        for (let r of routes) {
          getRoute(r, pathname)
        }
      }
    }
  }

  const intl = useIntl();
  getRoute(route, pathname);
  useEffect(() => {

    systemInfo().then((data) => {
      const {locale, version} = data
      setLocale(locale, false);
      setVersion(version)
    })

    if (crumb) {
      setBreadcrumb(crumb.map((c: any) => {
        const {name, route} = c
        return <Breadcrumb.Item key="list" link={route}>
          {intl.formatMessage({id: name})}
        </Breadcrumb.Item>
      }))
    } else {
      setBreadcrumb(<Breadcrumb.Item key="home" link={"/"}>
        {intl.formatMessage({id: 'menu.overview'})}
      </Breadcrumb.Item>)
    }
  }, [pathname])

  return <>
    <Topbar/>
    <AppLayout nav={<Nav version={version}/>} adjustHeight={50}>
      <Page>
        <Page.Header breadcrumb={<Breadcrumb>{breadcrumb}</Breadcrumb>}/>
        <Page.Content>
          {children}
        </Page.Content>
      </Page>
    </AppLayout>
  </>
}
