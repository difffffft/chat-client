import service from "@/utils/request.js";
import {BASE_URL} from "@/constants/index.js";

export const useHavePluginListApi = async (data) => {
    return service.post(BASE_URL + '/chat/have/plugin/list', data)
}

export const useRunPluginListApi = async (data) => {
    return service.post(BASE_URL + '/chat/run/plugin/list', data)
}

export const useChatStreamApi = async (data) => {
    return await fetch(BASE_URL + '/chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
}