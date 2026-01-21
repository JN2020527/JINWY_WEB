import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 备考篮状态管理
const basketItems = ref([])
const basketCount = ref(0)

// 我的备考作业列表
const myExamPrepList = ref([
  {
    id: 1,
    name: '2025年全国初中语文试卷',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-30 16:32:55',
    isLocked: false,
    questions: [] // 包含的题目列表
  },
  {
    id: 2,
    name: '课标文言文',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-30 14:32:55',
    isLocked: false,
    questions: []
  },
  {
    id: 3,
    name: '古诗文默写',
    type: '试题组卷',
    stage: '初中',
    subject: '语文',
    editTime: '2025-10-24 14:40:08',
    isLocked: false,
    questions: []
  }
])

// 添加题目到备考篮
export const addToBasket = (question) => {
  // 检查是否已存在相同题型
  const existingItem = basketItems.value.find(item => item.type === question.type)

  if (existingItem) {
    // 如果存在，数量+1
    existingItem.count += 1
  } else {
    // 如果不存在，添加新项
    basketItems.value.push({
      type: question.type,
      count: 1,
      questions: [question]
    })
  }

  // 更新总数
  basketCount.value += 1
}

// 从备考篮删除题目
export const removeFromBasket = (type) => {
  const index = basketItems.value.findIndex(item => item.type === type)
  if (index !== -1) {
    basketCount.value -= basketItems.value[index].count
    basketItems.value.splice(index, 1)
  }
}

// 清空备考篮
export const clearBasket = () => {
  basketItems.value = []
  basketCount.value = 0
}

// 直接将章节内容保存为作业到“我的备考”
export const saveToMyExamPrep = (catalogName, questions, currentStage = '初中', currentSubject = '英语') => {
  if (!catalogName || !questions || questions.length === 0) {
    ElMessage.warning('暂无内容可保存')
    return false
  }

  // 创建新作业
  const newWork = {
    id: Date.now(), // 使用时间戳作为ID
    name: catalogName, // 使用章节名称作为作业名称
    type: '试题组卷', // 作业类型
    stage: currentStage,
    subject: currentSubject,
    editTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-'),
    isLocked: false,
    questions: [...questions], // 复制题目数组
    categoryId: 'uncategorized' // 默认为未分类
  }

  // 添加到列表最前面
  myExamPrepList.value.unshift(newWork)

  ElMessage.success(`已将“${catalogName}”保存为作业，共${questions.length}个知识点！可在「我的」→「我的备考」中查看`)

  return true
}

// 导出响应式数据
export const useExamBasket = () => {
  return {
    basketItems,
    basketCount,
    myExamPrepList, // 导出我的备考列表
    addToBasket,
    removeFromBasket,
    clearBasket,
    saveToMyExamPrep // 导出保存函数
  }
}

