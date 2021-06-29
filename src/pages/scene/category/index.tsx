import React, {useEffect, useState} from 'react'
import {Search, Tree} from '@alicloud/console-components'
import {getScenarioCategories} from "@/services/scenarios";

let matchedKeys: Array<string> = []

const SceneCategory = () => {

  const [expandedKeys, setExpandedKeys] = useState<Array<any>>(['2'])
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true)
  const [category, setCategory] = useState<Array<any>>([])

  useEffect(() => {
    getScenarioCategories().then(function (data) {
      setCategory(data.map((item: any) => ({
          label: item.name,
          key: item.categoryId,
          children: item.children.map((item: any) => (
            {
              label: item.name,
              key: item.categoryId,
            }))
        })
      ))
      setExpandedKeys(data.map((item: any) => (item.categoryId)))
    })
  }, [])

  const handleSearch = (value: string) => {

    value = value.trim()
    if (!value) {
      return
    }

    const loop = (category: any) => category.forEach((item: any) => {
      if (item.label.indexOf(value) > -1) {
        matchedKeys.push(item.key)
      }
      if (item.children && item.children.length) {
        loop(item.children)
      }
    })

    loop(category)

    matchedKeys = [...matchedKeys]
    setExpandedKeys(matchedKeys)
    setAutoExpandParent(true)
  }

  const filterTreeNode = (node: any) => {
    return matchedKeys && matchedKeys.indexOf(node.props.eventKey) > -1
  }

  return (
    <div>
      <Search shape="simple" size="medium" style={{width: '200px', marginBottom: '10px'}}
              onChange={(value) => {
                handleSearch(value)
              }}/>
      <Tree expandedKeys={expandedKeys} autoExpandParent={autoExpandParent} filterTreeNode={filterTreeNode}
            defaultExpandedKeys={expandedKeys}
            onExpand={(expandedKeys: Array<any>, extra: {}) => {
              setExpandedKeys(expandedKeys)
              setAutoExpandParent(false)
            }} dataSource={category}/>
    </div>
  )
}

SceneCategory.title = 'menu.scenario.category'
SceneCategory.crumb = [{name: 'menu.scenario.category'}]

export default SceneCategory
