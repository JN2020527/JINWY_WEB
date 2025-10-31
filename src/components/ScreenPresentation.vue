<template>
  <div v-if="visible" class="screen-presentation">
    <div class="screen-content">
      <!-- 题目内容区域 -->
      <div class="question-display" :style="{ fontSize: fontSize + 'px' }">
        <div class="question-text" v-html="currentQuestion?.content"></div>
        
        <!-- 答案解析显示 -->
        <div v-if="showAnswer" class="answer-display">
          <div class="answer-item">
            <strong>【答案】</strong>
            <div class="answer-content" v-html="currentQuestion?.answer"></div>
          </div>
          <div v-if="currentQuestion?.analysis" class="answer-item">
            <strong>【解析】</strong>
            <div class="answer-content" v-html="currentQuestion?.analysis"></div>
          </div>
        </div>
      </div>

      <!-- 右侧功能按钮 -->
      <div class="right-toolbar">
        <div class="toolbar-item" @click="toggleAnswer">
          <el-icon><Document /></el-icon>
          <span>答案解析</span>
        </div>
        <div class="toolbar-item">
          <el-icon><Grid /></el-icon>
          <span>类题练习</span>
        </div>
        <div class="toolbar-item">
          <el-icon><List /></el-icon>
          <span>题目列表</span>
        </div>
        <div class="toolbar-item" @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
          <span>全屏</span>
        </div>
        <div class="toolbar-item" @click="closePresentation">
          <el-icon><Back /></el-icon>
          <span>返回</span>
        </div>
      </div>

      <!-- 底部控制条 -->
      <div class="bottom-controls">
        <div class="control-item" @click="zoomIn">
          <el-icon><ZoomIn /></el-icon>
          <span>放大</span>
        </div>
        <div class="control-item" @click="zoomOut">
          <el-icon><ZoomOut /></el-icon>
          <span>缩小</span>
        </div>
        <div class="control-item" @click="prevQuestion">
          <el-icon><ArrowLeft /></el-icon>
          <span>上一题</span>
        </div>
        <div class="control-item" @click="nextQuestion">
          <el-icon><ArrowRight /></el-icon>
          <span>下一题</span>
        </div>
        <div class="control-item">
          <el-icon><Edit /></el-icon>
          <span>手写</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document, Grid, List, FullScreen, Back, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  question: {
    type: Object,
    default: null
  },
  questions: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'change-question'])

const showAnswer = ref(false)
const fontSize = ref(24)
const isFullscreen = ref(false)

const currentQuestion = computed(() => props.question)

// 切换答案显示
const toggleAnswer = () => {
  showAnswer.value = !showAnswer.value
}

// 放大
const zoomIn = () => {
  if (fontSize.value < 48) {
    fontSize.value += 2
  }
}

// 缩小
const zoomOut = () => {
  if (fontSize.value > 16) {
    fontSize.value -= 2
  }
}

// 上一题
const prevQuestion = () => {
  if (props.currentIndex > 0) {
    emit('change-question', props.currentIndex - 1)
  }
}

// 下一题
const nextQuestion = () => {
  if (props.currentIndex < props.questions.length - 1) {
    emit('change-question', props.currentIndex + 1)
  }
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 关闭演示
const closePresentation = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  showAnswer.value = false
  emit('close')
}
</script>

<style scoped>
.screen-presentation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e4d3d 0%, #2a5a4a 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.screen-content {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 60px 120px 100px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.screen-content::-webkit-scrollbar {
  width: 8px;
}

.screen-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.screen-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.screen-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.question-display {
  max-width: 1200px;
  width: 100%;
  color: #ffffff;
  line-height: 2;
  padding: 40px;
  transition: font-size 0.3s;
  text-align: left;
}

.question-text {
  margin-bottom: 40px;
}

.question-text :deep(br) {
  display: block;
  margin: 16px 0;
  content: "";
}

.question-text :deep(strong) {
  color: #ffd700;
  font-weight: 600;
  font-size: 1.1em;
}

.answer-display {
  background: rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 8px;
  margin-top: 40px;
  animation: slideDown 0.3s;
}

.answer-item {
  margin-bottom: 24px;
}

.answer-item:last-child {
  margin-bottom: 0;
}

.answer-item strong {
  display: block;
  color: #ffd700;
  font-size: 22px;
  margin-bottom: 12px;
}

.answer-content {
  font-size: 20px;
  line-height: 1.8;
  color: #ffffff;
}

.answer-content :deep(strong) {
  color: #ffd700;
  font-weight: 600;
}

.answer-content :deep(br) {
  display: block;
  margin: 10px 0;
  content: "";
}

/* 右侧工具栏 */
.right-toolbar {
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.toolbar-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(-5px);
}

.toolbar-item .el-icon {
  font-size: 24px;
}

/* 底部控制条 */
.bottom-controls {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 20px 40px;
  border-radius: 50px;
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px 16px;
  border-radius: 8px;
}

.control-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.control-item .el-icon {
  font-size: 24px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

