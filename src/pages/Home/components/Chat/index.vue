<script setup>
import {useAppStore} from "@/stores/modules/appStore";
import {OPENAI_ROLE_AVATAR, OPENAI_ROLES, PLUGIN_CALL_STATUS} from "@/enums";
import {marked} from "marked";
import {ref} from "vue";
import Header from '../Header/index.vue'
import {ElMessage} from "element-plus";

const props = defineProps({
  chatList: {
    type: Array,
    required: true
  }
})

const emits = defineEmits(['onSend', 'onClear', 'onConfirmRunPlugin', 'onCancelRunPlugin', 'onRestartRunPlugin', 'onRestartAnswer'])

const appStore = useAppStore()


/**
 * 用户当前输入的提示词
 * The prompt word currently entered by the user
 *
 * @type {Ref<UnwrapRef<string>>}
 */
const prompt = ref('')

/**
 * MarkDown转Html
 * @param value
 * @returns {string | Promise<string>}
 */
const mdToHtml = (value) => {
  return marked.parse(value)
}

/**
 * 发送提示词
 * @returns {Promise<void>}
 */
const onSend = async () => {
  await emits('onSend', prompt.value)
  prompt.value = ''
}

/**
 * 清空提示词
 */
const clearPrompt = () => {
  prompt.value = ''
}

const onSendMessage = async (event) => {
  if (!event.shiftKey) {
    await onSend()
  }
}

const isTextareaFocused = ref(false)
const onTextareaFocus = () => {
  isTextareaFocused.value = true;
}
const onTextareaBlur = () => {
  isTextareaFocused.value = false;
}


const contentContainer = ref(null)
/**
 * 滚动到最下方
 * Scroll to the bottom
 *
 */
const startScrollBottom = () => {
  contentContainer.value.scrollTop = contentContainer.value.scrollHeight
}

const onCopyCodeSuccess = () => {
  ElMessage.success("代码复制成功！")
}

defineExpose({
  clearPrompt,
  startScrollBottom
})
</script>

<template>
  <div class="chat">

    <!--头部-->
    <Header @onClear="emits('onClear')"></Header>

    <!--内容展示区，问题区，回答区-->
    <main ref="contentContainer">
      <ul class="content-container" v-if="chatList.length > 0">

        <template v-for="(chat, index) in chatList" :key="chat._id">
          <li
              v-if="chat.role !== OPENAI_ROLES.TOOL"
              class="content"
              :class="{
            'user-content' : chat.role === OPENAI_ROLES.USER,
            'assistant-content': (chat.role === OPENAI_ROLES.ASSISTANT && !chat.tool_calls),
            'plugin-content': chat.role === OPENAI_ROLES.ASSISTANT && chat.tool_calls
        }">

            <el-avatar :src="OPENAI_ROLE_AVATAR[chat.role]"></el-avatar>
            <div class="content-msg" v-if="chat._loading" v-loading="chat._loading"></div>
            <div class="content-msg" v-else>

              <!--用户-->
              <template v-if="chat.role === OPENAI_ROLES.USER">
                <pre
                    style="white-space: pre-wrap;font-size: 16px;font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;">{{
                    chat.content
                  }}</pre>
              </template>

              <!--助手-->
              <template v-else-if="chat.role === OPENAI_ROLES.ASSISTANT && !chat.tool_calls">
                <template v-if="chat._error && index === chatList.length - 1">
                  回答异常
                  <el-button text bg style="margin-left: 8px" @click="emits('onRestartAnswer', chat._id)">重试
                  </el-button>
                </template>
                <template v-else-if="chat._error && index !== chatList.length - 1">
                  回答异常
                </template>
                <template v-else>
                  <v-md-preview :text="chat.content" @copy-code-success="onCopyCodeSuccess"></v-md-preview>
                </template>
              </template>

              <!--插件-->
              <template v-else-if="chat.role === OPENAI_ROLES.ASSISTANT && chat.tool_calls">
                <div v-if="chat._plugin_status === PLUGIN_CALL_STATUS.UN_CALL">
                  确认执行插件吗？
                  <a style="color: var(--el-color-primary)" @click="emits('onConfirmRunPlugin', chat._id)">确认</a><a
                    style="color: #999" @click="emits('onCancelRunPlugin', chat._id)">取消</a>
                </div>
                <div v-else-if="chat._plugin_status === PLUGIN_CALL_STATUS.RUNNING">
                  <span v-loading="true"></span>
                </div>
                <div v-else-if="chat._plugin_status === PLUGIN_CALL_STATUS.SUCCESS">
                  插件运行成功
                </div>
                <div v-else-if="chat._plugin_status === PLUGIN_CALL_STATUS.ERROR">
                  插件运行失败
                  <el-button v-if="index === chatList.length - 1" text bg style="margin-left: 8px"
                             @click="emits('onRestartRunPlugin', chat._id)">重试
                  </el-button>
                </div>
              </template>
            </div>
          </li>
        </template>


      </ul>
      <BaseEmpty v-else></BaseEmpty>
    </main>

    <!--用户输入文本，点击发送-->
    <footer>
      <div class="footer-container" :class="{ 'focused': isTextareaFocused }">
        <el-input
            v-model="prompt"
            type="textarea" :autosize="{minRows:1,maxRows:8}"
            @keyup.enter="onSendMessage" @focus="onTextareaFocus" @blur="onTextareaBlur"></el-input>
        <el-button :disabled="prompt===''" class="send-button" :class="{'send-button-disable':prompt===''}" type="info"
                   icon="Top" @click="onSend"/>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.chat {
  flex: 1;
  height: 100%;
  background-color: $m-chat-bg;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
}


main {
  flex: 1;
  overflow-y: auto;

  .content-container {
    margin: 0 auto;
    padding: 20px 60px;
    display: flex;
    flex-direction: column;
  }

  .content {
    width: 100%;
    display: flex;
    margin-bottom: 20px;

    .content-msg {
      flex: 1;
      display: flex;
      align-items: center;
      margin-left:12px;

      ::v-deep(.el-loading-mask) {
        --el-loading-spinner-size: 32px;
        background-color: transparent;

        .el-loading-spinner {
          width: auto;
          margin-left: 20px;
        }
      }
    }
  }

  .user-content {
    .content-msg {
      color: white;
      border-top-right-radius: 0;
      margin-right: 8px;
    }
  }

  .assistant-content {
    .content-msg {
      border-top-left-radius: 0;
    }
  }

  .plugin-content {
    .content-msg {
      padding-left: 10px;

      a + a {
        margin-left: 10px;
      }
    }
  }
}


footer {
  margin: 0 auto;

  .footer-container {
    display: flex;
    align-items: flex-end;
    border-radius: 12px;
    border: 1px solid rgba(217, 217, 227, .2);
    padding: 8px;

    ::v-deep(textarea) {
      box-shadow: none;
      background-color: transparent;
      resize: none;
    }

    .send-button {
      color: black;
      background-color: white;
    }

    .send-button:hover {
      background-color: black;
      color: white;
    }

    .send-button-disable {
      background-color: #222222;
      color: #999;
    }

    .send-button-disable:hover {
      background-color: #222222;
      color: #999;
    }
  }

  .footer-container.focused {
    border-color: rgba(217, 217, 227, .4);
  }
}


.content-container, footer {
  width: 60%;
}

@media screen and (max-width: $m-mobile-width) {
  .content-container {
    padding: 20px 0 !important;
    width: 100%;
  }

  footer {
    width: 100%;
  }
}

::v-deep(.vuepress-markdown-body) {
  margin-top: 20px;
  background: #404254;
  border-radius: 8px;
  color: #FFF;
}
</style>