import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function getProbesPageable(params?: any) {
  return extendRequest('/GetProbesPageable', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function uninstallProbe(params?: any) {
  return extendRequest('/UninstallProbe', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function installProbe(params?: any) {
  return extendRequest('/InstallProbe', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getAnsibleHosts(params?: any) {
  return extendRequest('/GetAnsibleHosts', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function unbanProbe(params?: any) {
  return extendRequest('/UnbanProbe', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function banProbe(params?: any) {
  return extendRequest('/BanProbe', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function deleteProbe(params?: any) {
  return extendRequest('/DeleteProbe', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

