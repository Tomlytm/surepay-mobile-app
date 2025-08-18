 
import axios from "axios";
import config from "../app-config";
import axiosInstance from "../axios-config";

const { baseUrl } = config;

interface Request {
  url: string;
  body?: any;
  auth?: boolean;
  paginate?: boolean;
  [x: string]: any;
}

const del = async ({ url, body: data }: Request) =>
  (
    await axiosInstance.delete(url, {
      data,
    })
  ).data;

const get = async ({ url, auth = true, paginate = false }: Request) => {
  const response = await (auth
    ? axiosInstance.get(url)
    : axios.get(baseUrl + url));
  const data = response.data;
  return paginate
    ? {
        data: data,
        totalPages: data?.totalPages,
        totalItems: data?.totalRecords,
        errors:data.errors,
      }
    : data;
};
const getWithRootData = async ({
  url,
  auth = true,
  paginate = false,
}: Request) => {
  const response = await (auth
    ? axiosInstance.get(url)
    : axios.get(baseUrl + url));
  const data = response.data;
  return paginate
    ? {
        data: data.data,
        totalPages: data?.totalPages,
        totalItems: data?.totalRecords,
      }
    : data;
};

const post = async ({ url, body, auth = true, options = {} }: Request) => {
  console.log(baseUrl, url, body, auth, options);
  return (
    await (auth
      ? axiosInstance.post(url, body, options)
      : axios.post(baseUrl + url, body))
  ).data;
};

const postWithRootData = async ({
  url,
  body,
  auth = true,
  options = {},
}: Request) => {
  return (
    await (auth
      ? axiosInstance.post(url, body, options)
      : axios.post(baseUrl + url, body))
  ).data;
};

const patch = async ({ url, body }: Request) =>
  (await axiosInstance.patch(url, body)).data.data;

const put = async ({ url, body }: Request) =>
  (await axiosInstance.put(url, body)).data.data;

const putWithRootData = async ({
  url,
  body,
  auth = true,
  options = {},
}: Request) => {
  return (
    await (auth
      ? axiosInstance.put(url, body, options)
      : axios.put(baseUrl + url, body))
  ).data;
};

const api = {
  delete: del,
  get,
  patch,
  post,
  put,
  getWithRootData,
  postWithRootData,
  putWithRootData,
};

export default api;
