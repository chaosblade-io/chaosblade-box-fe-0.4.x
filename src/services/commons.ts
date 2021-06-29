import {Message} from "@alicloud/console-components";
import {extend} from "umi-request";

export const errorHandler = function (error: any) {
  if (error.response) {
    Message.error(`status: ${error.response.status}, message: ${error.response.statusText} `)
  } else {
    Message.error(error.toString())
  }
  throw error
};

export const handler = function (data: any) {
  if (data.success) {
    return data.data
  } else {
    throw data.message
  }
};

export const extendRequest = extend({
  prefix: '/api',
  timeout: 30000
});
