/**
 * 基础依赖
 * basic dependency
 */
import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import ElementPlusIcons from '@/utils/elementPlusIcons'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


/**
 * MarkDown组件
 */
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'

import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index'
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css'

import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';

import Prism from 'prismjs'

/**
 * 项目相关
 * Project Related
 */
import '@/styles/common/index.scss'
import '@/styles/pc/index.scss'
import '@/styles/mobile/index.scss'
import App from './App.vue'
import router from './router'
import pinia from "@/stores"

import BaseEmpty from '@/components/BaseEmpty/index.vue'

VMdPreview.use(vuepressTheme, {
    Prism,
});
VMdPreview.use(createEmojiPlugin())
VMdPreview.use(createCopyCodePlugin());

const app = createApp(App)

app.component('BaseEmpty', BaseEmpty)

app.use(pinia)
app.use(router)
app.use(ElementPlus, {locale: zhCn})
app.use(ElementPlusIcons)
app.use(VMdPreview)

app.mount('#app')
