import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function getMachinesForHost(params?: any) {
  return extendRequest('/GetMachinesForHost', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function banMachine(machineId: number) {
  return extendRequest('/BanMachine', {
    method: 'POST',
    data: {machineId: machineId}
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function unbanMachine(machineId: number) {
  return extendRequest('/UnbanMachine', {
    method: 'POST',
    data: {machineId: machineId}
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getMachinesForPodPageable(params?: any) {
  return extendRequest('/GetMachinesForPodPageable', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getMachinesForNodePageable(params?: any) {
  return extendRequest('/GetMachinesForNodePageable', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getHostTotalStatistics(params?: any) {
  return extendRequest('/GetHostTotalStatistics', {
    method: 'GET',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}

export async function getK8sResourceStatistics(params?: any) {
  return extendRequest('/GetK8sResourceStatistics', {
    method: 'GET',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}
