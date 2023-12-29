import {defineStore} from 'pinia'
import {ref} from "vue";

export const useAppStore = defineStore('app', () => {

    /**
     * 历史列表是否展开
     * Whether the history list is expanded or not
     */
    const historyCollapse = ref(false)

    /**
     * 展开或者关闭历史列表
     * Expand or close the history list
     */
    const historyCollapseToggle = () => {
        historyCollapse.value = !historyCollapse.value
    }


    return {
        historyCollapse,
        historyCollapseToggle,
    }
})
