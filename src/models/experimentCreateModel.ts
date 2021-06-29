import {Effect, Reducer, Subscription} from 'umi'
import url from "url"
import {getExperimentById} from "@/services/experimentDetail"
import _ from "lodash"

export const NS_EXPERIMENT_CREATE: string = 'experimentCreate'
export const max_ = 5000

export interface Machine {
  machineId: number
  name: string
}

export interface StateType {
  experimentName?: string
  dimension?: 'host' | 'node' | 'pod' | 'container'
  scenarios: Array<any>
  selectMachines: Array<Machine>
  selectMetrics: Array<any>
  loading?: boolean
}

export interface ExperimentCreateModelType {
  namespace: string
  state: StateType
  effects: {
    GetExperimentById: Effect
    fillExperimentName: Effect
    selectDimension: Effect
    selectMachines: Effect
    selectScenarios: Effect
    fillParameter: Effect
    clear: Effect
    selectMetrics: Effect
    loading: Effect
  }
  reducers: {
    fillExperimentScenarios: Reducer<StateType>
    experimentName: Reducer<StateType>
    fillDimension: Reducer<StateType>
    fillSelectMachines: Reducer<StateType>
    fillParameters: Reducer<StateType>
    clearAll: Reducer<StateType>
    fillMetrics: Reducer<StateType>
    fillMetricsParams: Reducer<StateType>
    setLoading: Reducer<StateType>
  }
  subscriptions: { setup: Subscription }
}

const ExperimentCreateModel: ExperimentCreateModelType = {
  namespace: NS_EXPERIMENT_CREATE,
  state: {
    experimentName: '',
    dimension: 'host',
    scenarios: [],
    selectMachines: [],
    selectMetrics: [],
    loading: false
  },

  effects: {
    * GetExperimentById({payload}, {call, put}) {
      const {experimentId} = payload
      const data = yield call(getExperimentById, experimentId)
      yield put({
        type: 'fillExperimentScenarios',
        payload: data,
      })
      yield put({
        type: 'fillDimension',
        payload: data,
      })
      yield put({
        type: 'experimentName',
        payload: data,
      })
      yield put({
        type: 'fillSelectMachines',
        payload: data,
      })
      yield put({
        type: 'fillMetrics',
        payload: data,
      })
      yield put({
        type: 'setLoading',
        payload: {loading: false},
      })
    },
    * fillExperimentName({payload}, {call, put}) {
      yield put({
        type: 'experimentName',
        payload: payload,
      })
    },
    * selectMachines({payload}, {call, put}) {
      yield put({
        type: 'fillSelectMachines',
        payload: payload,
      })
    },
    * selectDimension({payload}, {call, put}) {
      yield put({
        type: 'fillDimension',
        payload: payload,
      })
    },
    * selectScenarios({payload}, {call, put}) {
      yield put({
        type: 'fillExperimentScenarios',
        payload: payload,
      })
    },
    * fillParameter({payload}, {call, put}) {
      yield put({
        type: 'fillParameters',
        payload: payload,
      })
    },
    * clear({payload}, {call, put}) {
      yield put({
        type: 'clearAll',
        payload: payload,
      })
    },
    * loading({payload}, {call, put}) {
      const {loading} = payload
      yield put({
        type: 'setLoading',
        payload: {loading: loading},
      })
    },
    * selectMetrics({payload}, {call, put}) {
      yield put({
        type: 'fillMetrics',
        payload: payload,
      })
    },
  },
  reducers: {
    fillExperimentScenarios(state: any, {payload}) {
      const {scenarios} = payload
      return {
        ...state,
        scenarios: scenarios ? [...scenarios] : state.scenarios,
      }
    },
    experimentName(state: any, {payload}) {
      const {experimentName} = payload
      return {
        ...state,
        experimentName: experimentName,
      }
    },
    fillSelectMachines(state: any, {payload}) {
      const {machines} = payload
      return {
        ...state,
        selectMachines: [...machines],
      }
    },
    fillDimension(state: any, {payload}) {
      const {dimension} = payload
      return {
        ...state,
        dimension: _.isEmpty(dimension) ? state.dimension : dimension,
      }
    },
    fillParameters(state: any, {payload}) {
      const {scenarioId} = payload
      const {parameter} = payload
      let scenarios = state.scenarios.map((scene: any) => {
        const {parameters} = scene
        if (scene.scenarioId === scenarioId) {
          return {
            ...scene,
            parameters: parameters.map((param: any) => {
              if (param.name === parameter.name) {
                return {
                  ...param,
                  value: parameter.value
                }
              }
              return param
            })
          }
        }
        return scene
      });
      return {
        ...state,
        scenarios: scenarios
      }
    },
    clearAll(state: any, {payload}) {
      return {
        experimentName: '',
        dimension: 'host',
        scenarios: [],
        machines: [],
        metrics: [],
        selectMachines: [],
        selectMetrics: [],
        loading: false
      }
    },
    setLoading(state: any, {payload}) {
      const {loading} = payload
      return {
        ...state,
        loading: loading,
      }
    },
    fillMetrics(state: any, {payload}) {
      const {metrics} = payload
      return {
        ...state,
        selectMetrics: [...metrics],
      }
    },
    fillMetricsParams(state: any, {payload}) {
      const {categoryId} = payload
      const {param} = payload
      let selectMetrics = state.selectMetrics.map((metric: any) => {
        const {params} = metric
        if (metric.categoryId === categoryId) {
          return {
            ...metric,
            params: params.map((p: any) => {
              if (p.name === param.name) {
                return {
                  ...p,
                  value: param.value
                }
              }
              return p
            })
          }
        }
        return metric
      });
      return {
        ...state,
        selectMetrics: [...selectMetrics],
      }
    },
  },
  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        if (pathname === '/experiment/creating') {
          const payload = url.parse(history.location.search, true).query
          if (!_.isEmpty(payload.experimentId)) {
            dispatch({
              type: 'GetExperimentById',
              payload,
            })
            dispatch({
              type: 'loading',
              payload: {loading: true}
            });
          }
          dispatch({
            type: 'selectDimension',
            payload: {dimension: 'host'}
          })
        }
      })
    },
  },
}

export default ExperimentCreateModel
