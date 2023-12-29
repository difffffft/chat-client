<script setup>
import {useChatStreamApi, useHavePluginListApi, useRunPluginListApi} from "@/api/sys/chat";
import Chat from "./components/Chat/index.vue";
import {useRoute, useRouter} from "vue-router";
import {computed, nextTick, onBeforeMount, onMounted, ref} from "vue";
import {nanoid} from "nanoid";
import {OPENAI_ROLES, PLUGIN_CALL_STATUS} from "@/enums/index.js";
import {useDark, useToggle} from "@vueuse/core";
import {marked} from "marked";
import {HISTORY_CACHE_NAME} from "@/constants/index.js";
import {assign} from "qs/lib/utils.js";

const route = useRoute()
const router = useRouter()


/**s
 * 聊天组件
 * Chat component
 *
 * @type {any}
 */
const chatRef = ref(null)

/**
 * 聊天会话ID
 * Chat Session ID
 *
 * @type {Ref<UnwrapRef<string | RouteParamValue[]>>}
 */
const chatSessionId = computed(() => {
  return route.params.id || ''
})


const chatList = ref(localStorage.getItem(HISTORY_CACHE_NAME) ? JSON.parse(localStorage.getItem(HISTORY_CACHE_NAME)) : [])

const onClear = () => {
  chatList.value = []
  saveChatList()
}

const saveChatList = () => {
  localStorage.setItem(HISTORY_CACHE_NAME, JSON.stringify(chatList.value))
}

/**
 * 确认执行插件
 */
const onConfirmRunPlugin = async (_id) => {
  // 下发几个插件, 显示给用户，展示调度状态
  const _answer_index = chatList.value.findIndex(item => item._id === _id)
  const idList = []
  // 有几个插件，下发几个插件
  chatList.value[_answer_index].tool_calls.forEach(tool => {
    chatList.value.push({
      tool_call_id: tool.id,
      name: tool.function.name,
      role: 'tool',
      content: '',

      _id: tool.id,
    })
    idList.push(tool.id)
  })
  try {
    chatList.value[_answer_index]._plugin_status = PLUGIN_CALL_STATUS.RUNNING
    const tool_calls = await useRunPluginListApi({
      tool_calls: chatList.value[_answer_index].tool_calls
    })
    // 调用成功，填充内容
    chatList.value[_answer_index]._plugin_status = PLUGIN_CALL_STATUS.SUCCESS
    tool_calls.forEach(tool => {
      let n = chatList.value.findIndex(item => item._id === tool.id)
      if (n !== -1) {
        chatList.value[n].content = tool.response
      }
    })

    // 继续回答问题
    const chat_list = getDefaultData()
    const answer = {
      role: OPENAI_ROLES.ASSISTANT,
      content: "",

      _id: nanoid(),
      _loading: true,
      _error: false,
    }
    chatList.value.push(answer)
    await onDefaultAnswer({answer, chat_list})
  } catch (e) {
    idList.forEach(id => {
      const _index = chatList.value.findIndex(item => item._id === id)
      chatList.value.splice(_index, 1)
    })
    // 修改调用状态
    chatList.value[_answer_index]._error = true
    chatList.value[_answer_index]._plugin_status = PLUGIN_CALL_STATUS.ERROR
  } finally {
    saveChatList()
  }
}

/**
 * 取消执行插件, 删除界面的提示
 */
const onCancelRunPlugin = (_id) => {
  let _answer_index = chatList.value.findIndex(item => item._id === _id)
  if (_answer_index !== -1) {
    chatList.value.splice(_answer_index, 1)
    saveChatList()
  }
}


/**
 * 回复用户，
 * 需要过滤掉数据中的带tool_calls，tool_call_id这些属性的
 */
const getDefaultData = () => {
  // 需要很干净的数据，避免上下文过多
  const chat_list = JSON.parse(JSON.stringify(chatList.value))
  return chat_list.filter(chat => {
    return !(chat.hasOwnProperty('_error') && chat._error === true);
  })
}

/**
 * 正常回答用户，
 * 需要过滤掉数据中的带tool_calls，tool_call_id这些属性的
 */
const onDefaultAnswer = async ({answer, chat_list}) => {
  // 获取当前的回答者
  let _answer = chatList.value.find(item => item._id === answer._id)
  let _answer_index = chatList.value.findIndex(item => item._id === answer._id)

  try {
    const response = await useChatStreamApi({
      chat_list
    })
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    // 用户回答是个流，得一个一个加上
    while (true) {
      const {done, value} = await reader.read()
      if (done) {
        break
      }
      const str = decoder.decode(value)
      if (_answer) {
        // 要回答了，先关闭loading
        if (_answer._loading) {
          _answer._loading = false
        }
        if (_answer._error) {
          _answer._error = false
        }
        _answer.content += str
        // 回答一下滚动一下
        await nextTick(() => {
          chatRef.value.startScrollBottom()
        })
      }
    }
  } catch (e) {
    // 回答错误
    if (_answer_index !== -1) {
      chatList.value[_answer_index]._error = true
      chatList.value[_answer_index]._loading = false
    }
  } finally {
    // 无论回答正常，还是回答错误，保存一下上下文
    saveChatList()
  }
}


/**
 * 用户发送在发送提示词
 * When a user sends a new cue
 *
 */
const onSend = async (prompt) => {

  const question = {
    role: OPENAI_ROLES.USER,
    content: prompt,

    // 唯一ID
    _id: nanoid(),
  }

  const answer = {
    role: OPENAI_ROLES.ASSISTANT,
    // 此时接口还未回答，content为空
    content: '',

    // 唯一ID
    _id: nanoid(),
    // 进度条
    _loading: true,
    // 回答是否正常
    _error: false,
  }
  // 界面新增用户的提问
  chatList.value.push(question)

  try {
    // 获取历史上下文
    const chat_list = getDefaultData()
    // 界面新增用户的回答
    chatList.value.push(answer)
    // 发起请求，让GPT判断当前对话是否使用到插件
    const _response = await useHavePluginListApi({
      chat_list
    })
    let _answer_index = chatList.value.findIndex(item => item._id === answer._id)
    // 如果返回的有数据，代表要使用插件
    if (_response) {
      if (_answer_index !== -1) {
        // 插件调用状态，0表示未调用，1表示调用成功，2表示调用失败
        chatList.value[_answer_index]['_plugin_status'] = PLUGIN_CALL_STATUS.UN_CALL

        chatList.value[_answer_index]._loading = false
        // 那么就合并属性
        // 因为插件涉及风险因素，需要等待用户确认之后，再进行下一步操作。
        chatList.value[_answer_index] = assign(answer, _response['plugin_list'])
      }

      if (!_response['danger_flag']) {
        // 无危险系数的插件
        await onConfirmRunPlugin(answer._id)
      }
    } else {
      // 没有插件，正常回答用户
      await onDefaultAnswer({answer, chat_list})
    }
  } catch (e) {
    console.error("请求是否有插件错误", e)
    // 如果请求插件都出错了
    let _answer_index = chatList.value.findIndex(item => item._id === answer._id)
    if (_answer_index !== -1) {
      chatList.value[_answer_index]._error = true
      chatList.value[_answer_index]._loading = false
    }
  } finally {
    saveChatList()
  }
}


const onRestartAnswer = async (_id) => {
  const chat_list = getDefaultData()
  let _answer = chatList.value.find(item => item._id === _id)
  if (_answer) {
    _answer._error = true
    _answer._loading = true
  }
  await onDefaultAnswer({answer: _answer, chat_list})
}

/**
 * 切换成夜间模式
 */
onBeforeMount(() => {
  const isDark = useDark()
  if (!isDark.value) {
    const toggleDark = useToggle(isDark)
    toggleDark()
  }


  // 加载完成之后去除所有loading
  chatList.value.forEach(item => {
    if (item.hasOwnProperty("_loading") && item._loading) {
      item._loading = false
    }
  })
  saveChatList()
})
</script>

<template>
  <div class="home">
    <Chat
        ref="chatRef"
        :chatList="chatList"
        @onSend="onSend"
        @onClear="onClear"
        @onConfirmRunPlugin="onConfirmRunPlugin"
        @onCancelRunPlugin="onCancelRunPlugin"
        @onRestartRunPlugin="onConfirmRunPlugin"
        @onRestartAnswer="onRestartAnswer"
    ></Chat>
  </div>
</template>

<style lang="scss" scoped>
.home {
  width: 100%;
  display: flex;
  height: 100%;
  color: white;
}
</style>