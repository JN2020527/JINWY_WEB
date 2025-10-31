import { ref } from 'vue'

// 备考篮状态管理
const basketItems = ref([])
const basketCount = ref(0)

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

// 导出响应式数据
export const useExamBasket = () => {
  return {
    basketItems,
    basketCount,
    addToBasket,
    removeFromBasket,
    clearBasket
  }
}

