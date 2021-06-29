import {errorHandler, extendRequest} from "@/services/commons";

export async function fetchScenes(name: string, version: string) {
  return extendRequest(`/FetchChaostoolsVersionInfo/${name}/${version}/version.yaml`, {
    method: 'GET',
  }).then(function (response) {
    return response
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function fetchScenesList(name: string, version: string, sceneName: string) {
  return extendRequest(`/FetchChaostoolsScenarios/${name}/${version}/${sceneName}`, {
    method: 'GET',
  }).then(function (response) {
    return response
  }).catch(function (error) {
    return errorHandler(error);
  });
}
