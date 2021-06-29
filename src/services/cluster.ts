import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function addCluster(params?: any) {
  return extendRequest('/AddCluster', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function updateCluster(params?: any) {
  return extendRequest('/UpdateCluster', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getClusterPageable(params?: any) {
  return extendRequest('/GetClusterPageable', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function activeCollect(params?: any) {
  return extendRequest('/ActiveCollect', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function closeCollect(params?: any) {
  return extendRequest('/CloseCollect', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}
