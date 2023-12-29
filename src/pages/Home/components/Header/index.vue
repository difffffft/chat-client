<script setup>
import {ref} from 'vue'
import IconGithub from '@/components/IconGithub/index.vue'

const visible = ref(false)

const emits = defineEmits(['onClear'])
const confirm = () => {
  visible.value = false
  emits('onClear')
}
</script>

<template>
  <header>
    <el-popover :visible="visible" placement="bottom-end" :width="160">
      <p style="margin-bottom: 10px">确定清空？</p>
      <div style="text-align: right; margin: 0">
        <el-button size="small" text @click="visible = false">取消</el-button>
        <el-button size="small" type="primary" @click="confirm">确认</el-button>
      </div>
      <template #reference>
        <el-button type="default" bg text @click="visible = true">清空</el-button>
      </template>
    </el-popover>

    <div style="font-size: 26px;color: white">
      <a href="https://github.com/difffffft/chat-server" target="_blank">
        <IconGithub></IconGithub>
      </a>
    </div>
  </header>
</template>

<style>
header {
  display: flex;
  justify-content: space-between;
}
</style>