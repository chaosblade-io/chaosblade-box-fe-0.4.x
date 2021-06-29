import {StateType} from "@/models/experimentCreateModel";
import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function createExperiment(experiment: StateType) {
  return extendRequest('/CreateExperiment', {
    method: 'POST',
    data: {
      "experimentName": experiment.experimentName,
      "dimension": experiment.dimension,
      "machines": experiment.selectMachines,
      "metrics": experiment.selectMetrics,
      "scenarioId": experiment.scenarios[0].scenarioId,
      "parameters": experiment.scenarios[0].parameters
    },
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function updateExperiment(experimentId: any, experiment: StateType) {
  return extendRequest('/UpdateExperiment', {
    method: 'POST',
    data: {
      "experimentId": experimentId,
      "experimentName": experiment.experimentName,
      "dimension": experiment.dimension,
      "machines": experiment.selectMachines,
      "metrics": experiment.selectMetrics,
      "scenarioId": experiment.scenarios[0].scenarioId,
      "parameters": experiment.scenarios[0].parameters
    },
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getExperimentsPageable(params?: any) {
  return extendRequest('/GetExperimentsPageable', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function startExperiment(experimentId: string) {
  return extendRequest('/StartExperiment', {
    method: 'POST',
    data: {"experimentId": experimentId},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function stopExperiment(taskId: string) {
  return extendRequest('/EndExperiment', {
    method: 'POST',
    data: {"taskId": taskId},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getExperimentTotalStatistics() {
  return extendRequest('/GetExperimentTotalStatistics', {
    method: 'POST',
    data: {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

