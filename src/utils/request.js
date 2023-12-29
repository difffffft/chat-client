import axios from 'axios'
import qs from 'qs'
import {ElMessage} from 'element-plus'
import {BASE_URL} from "@/constants/index.js";

const service = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {'Content-Type': 'application/json;charset=UTF-8'}
})

service.interceptors.request.use(
    (config) => {
        config.headers['Accept-Language'] = 'zh-CN'
        /* 追加时间戳，防止GET请求缓存 */
        if (config.method.toUpperCase() === 'GET') {
            config.params = {...config.params, t: new Date().getTime()}
        }
        if (Object.values(config.headers).includes('application/x-www-form-urlencoded')) {
            config.data = qs.stringify(config.data)
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    response => {
        if (response.status !== 200) {
            ElMessage.error(response.statusText)
            return Promise.reject(new Error(response.statusText || 'Error'))
        }
        return response.data
    },
    error => {
        ElMessage.error(error.message)
        return Promise.reject(error)
    }
)

export default service