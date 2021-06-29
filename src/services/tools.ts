import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function deployChaostoolsToHost(params?: any) {
  return extendRequest('/DeployChaostoolsToHost', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function undeployChaostoolsForHost(params?: any) {
  return extendRequest('/UndeployChaostoolsForHost', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getHelmValueYaml(params?: any) {
  return extendRequest('/GetHelmValueYaml', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getChaostoolsPageable(params?: any) {
  return extendRequest('/GetChaostoolsPageable', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function deployChaostoolsToK8S(params?: any) {
  return extendRequest('/DeployChaostoolsToK8S', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function undeployChaostoolsToK8S(params?: any) {
  return extendRequest('/UndeployChaostoolsToK8S', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}
