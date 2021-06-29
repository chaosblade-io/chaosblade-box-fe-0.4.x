import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function systemInfo(params?: any) {
  return extendRequest('/SystemInfo', {
    method: 'GET',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}


export async function setI18n(params?: any) {
  return extendRequest('/I18n', {
    method: 'POST',
    data: params ? params : {},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}
