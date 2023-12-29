import {createApp} from 'vue'
import {defineComponent, ref} from 'vue'
import {ElButton, ElDialog} from 'element-plus'
import {CoffeeCup, Close, Delete} from "@element-plus/icons-vue";
import "./index.scss"

/**
 * 组件
 */
const BaseDialog = defineComponent({
    /**
     * 参数
     */
    props: {
        close: {
            type: Function,
            required: true,
            default: () => () => {
            }
        },


        title: {
            type: String,
            required: false,
            default: () => ''
        },
        msg: {
            type: String,
            required: false,
            default: () => ''
        },
    },
    /**
     * 业务逻辑
     */
    setup(props) {
        const visible = ref(true)
        const handleClose = () => {
            visible.value = false
            props.close()
        }
        const handleLogout = () => {
            props.close()
        }

        return {
            visible,
            handleClose,
            handleLogout
        }
    },
    /**
     * 组件
     */
    render(props) {
        return (
            <ElDialog
                align-center
                draggable
                width={'32%'}
                close-on-click-modal={false}
                modelValue={props.visible}
                onClose={props.handleClose}
                title={props.title}>
                <ul>
                    <li className={'setting-item'}>
                        <ElButton icon={Delete} style={{width: '100%', height: '50px'}} type="danger"
                                  text>清除所有聊天</ElButton>
                    </li>
                </ul>
            </ElDialog>
        )
    }
})


const useSettingDialog = props => {
    const mountNode = document.createElement('div')
    document.body.appendChild(mountNode)
    const close = () => {
        dialog.unmount()
        mountNode.remove()
    }
    const show = () => {
        // 挂载显示
        dialog.mount(mountNode)
    }
    const dialog = createApp(BaseDialog, {...props, close})
    return {
        show,
        close
    }
}
export default useSettingDialog