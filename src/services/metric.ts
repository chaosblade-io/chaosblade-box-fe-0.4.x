import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function queryMetricCategory(params?: any) {
  return extendRequest('/QueryMetricCategory', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function queryTaskMonitor(params?: any) {
  return extendRequest('/QueryTaskMonitor', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}
