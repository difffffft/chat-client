import {defineStore} from 'pinia'
import {ref} from "vue";
import {HISTORY_CACHE_NAME} from "@/constants/index.js";

export const useHistoryStore = defineStore('app', () => {

    /**
     * 历史列表
     * history list
     */

    const history = ref(localStorage.getItem(HISTORY_CACHE_NAME) ? JSON.parse(localStorage.getItem(HISTORY_CACHE_NAME)) : [])

    /**
     * 保存历史
     */
    const saveHistory = () => {
        localStorage.setItem(HISTORY_CACHE_NAME, JSON.stringify(history.value))
    }

    return {
        history,

        saveHistory
    }
})
