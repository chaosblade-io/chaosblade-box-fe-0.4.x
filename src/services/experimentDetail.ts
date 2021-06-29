import {errorHandler, extendRequest, handler} from "@/services/commons";

export async function getExperimentById(experimentId: string) {
  return extendRequest('/GetExperimentById', {
    method: 'POST',
    data: {"experimentId": experimentId},
  }).then(function (response) {
    return handler(response)
  }).catch(function (error) {
    return errorHandler(error);
  });
}
