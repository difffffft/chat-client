import userAvatar from '@/assets/images/assets-images-avatar-user.jpg'
import assistantAvatar2 from '@/assets/images/assets-images-logo.png'

export const OPENAI_ROLES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    TOOL: 'tool'
}

export const OPENAI_ROLE_AVATAR = {
    user: userAvatar,
    assistant: assistantAvatar2,
    tool: assistantAvatar2
}

export const PLUGIN_CALL_STATUS = {
    // 未调用
    UN_CALL: 'UN_CALL',

    // 运行中
    RUNNING: 'RUNNING',

    // 调用成功
    SUCCESS: 'SUCCESS',

    // 调用失败
    ERROR: 'ERROR',
}

