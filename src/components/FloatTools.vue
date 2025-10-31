<template>
  <div class="float-tools">
    <!-- 功能按钮列表 -->
    <!-- 备考篮 -->
    <el-popover v-if="isExpanded" placement="left" :width="340" trigger="click">
      <template #reference>
        <el-badge :value="basketCount || undefined" :hidden="basketCount === 0" class="tool-item">
          <div class="tool-button">
            <el-icon><ShoppingCart /></el-icon>
            <span class="tool-text">备考篮</span>
          </div>
        </el-badge>
      </template>
      <div class="basket-content">
        <!-- 学段学科选择器和题目统计 -->
        <div class="basket-header">
          <div class="basket-selector">
            <el-select v-model="selectedSubject" placeholder="请选择学段学科" size="default">
              <el-option label="初中-英语" value="middle-english" />
              <el-option label="初中-数学" value="middle-math" />
              <el-option label="初中-语文" value="middle-chinese" />
            </el-select>
          </div>
          
        <!-- 题目统计 -->
        <div class="basket-count">
          <span class="count-text">共计 <span class="count-num">{{ basketCount }}</span> 题</span>
        </div>
        </div>
        
        <!-- 题目列表表格 -->
        <div class="basket-table">
          <el-table 
            :data="basketItems" 
            border 
            size="default" 
            :max-height="basketItems.length > 0 ? 300 : undefined"
            style="width: 100%;"
            :empty-text="'暂无题目，快去添加吧~'"
          >
            <el-table-column prop="type" label="题型" align="left" />
            <el-table-column prop="count" label="数量" align="center" width="80" />
            <el-table-column label="操作" align="center" width="80">
              <template #default="{ row }">
                <el-button type="text" :icon="Delete" @click="removeItem(row.type)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 底部操作按钮 -->
        <div class="basket-footer">
          <el-button @click="clearAll" class="clear-btn">
            <el-icon><Delete /></el-icon>
            <span>清空全部</span>
          </el-button>
          <el-button type="primary" @click="goToExam">进入备考中心</el-button>
        </div>
      </div>
    </el-popover>

    <!-- 问题反馈 -->
    <div v-if="isExpanded" class="tool-item" @click="handleFeedback">
      <div class="tool-button">
        <el-icon><ChatDotSquare /></el-icon>
        <span class="tool-text">问题反馈</span>
      </div>
    </div>

    <!-- 使用说明 -->
    <div v-if="isExpanded" class="tool-item" @click="handleHelp">
      <div class="tool-button">
        <el-icon><QuestionFilled /></el-icon>
        <span class="tool-text">使用说明</span>
      </div>
    </div>

    <!-- 移动端 -->
    <el-popover v-if="isExpanded" placement="left" :width="180" trigger="hover">
      <template #reference>
        <div class="tool-item">
          <div class="tool-button">
            <el-icon><Iphone /></el-icon>
            <span class="tool-text">移动端</span>
          </div>
        </div>
      </template>
      <div class="qrcode-box">
        <img src="/bg.3e971a55.png" alt="二维码" style="width: 150px; height: 150px;" />
        <p style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;">
          扫码访问移动端
        </p>
      </div>
    </el-popover>

    <!-- 主按钮：展开/收起 -->
    <div class="tool-item main-button" @click="toggleExpand">
      <div class="tool-button">
        <el-icon>
          <ArrowUp v-if="isExpanded" />
          <ArrowDown v-else />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  ShoppingCart, ChatDotSquare, QuestionFilled, 
  Iphone, Delete, ArrowUp, ArrowDown 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useExamBasket } from '../store/examBasket'

const isExpanded = ref(true) // 默认展开
const selectedSubject = ref('middle-english')

// 使用备考篮状态
const { basketItems, basketCount, removeFromBasket, clearBasket } = useExamBasket()

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const clearAll = () => {
  clearBasket()
  ElMessage.success('已清空备考篮')
}

const handleFeedback = () => {
  ElMessage.info('问题反馈功能')
}

const handleHelp = () => {
  ElMessage.info('使用说明功能')
}

const removeItem = (type) => {
  removeFromBasket(type)
  ElMessage.success(`已删除${type}`)
}

const goToExam = () => {
  ElMessage.success('进入备考中心')
}
</script>

<style scoped>
.float-tools {
  position: fixed;
  right: 20px;
  bottom: 40px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-item {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  animation: fadeIn 0.3s ease;
}

/* 主按钮 - 与其他按钮样式一致 */
.tool-item.main-button {
  background: #fff;
}

.main-button .el-icon {
  font-size: 20px;
  transition: all 0.3s ease;
}

.tool-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 64px;
  height: 64px;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
}

.tool-button:hover {
  color: #409eff;
}

.tool-button .el-icon {
  font-size: 20px;
}

.tool-text {
  font-size: 12px;
  white-space: nowrap;
}

.basket-content {
  padding: 16px;
}

/* 头部区域：学科选择器和题目统计 */
.basket-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

/* 学段学科选择器 */
.basket-selector {
  flex: 1;
}

.basket-selector :deep(.el-select) {
  width: 100%;
}

/* 题目统计 */
.basket-count {
  flex-shrink: 0;
  padding: 8px 0;
  text-align: center;
  white-space: nowrap;
}

.count-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.count-num {
  font-size: 18px;
  color: #2262FB;
  font-weight: 600;
  margin: 0 2px;
}

/* 表格样式 */
.basket-table {
  margin-bottom: 16px;
}

.basket-table :deep(.el-table) {
  font-size: 14px;
}

.basket-table :deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

.basket-table :deep(.el-table td) {
  padding: 10px 0;
}

.basket-table :deep(.el-table__empty-block) {
  min-height: 60px;
  height: 60px;
}

.basket-table :deep(.el-table__empty-text) {
  color: #909399;
  font-size: 13px;
}

.basket-table :deep(.el-button.is-text) {
  color: #409eff;
  font-size: 18px;
  padding: 0;
}

.basket-table :deep(.el-button.is-text:hover) {
  color: #f56c6c;
}

/* 底部按钮 */
.basket-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.basket-footer .el-button {
  flex: 1;
  font-size: 14px;
}

.basket-footer :deep(.el-button--primary) {
  background-color: #2262FB;
  border-color: #2262FB;
}

.basket-footer :deep(.el-button--primary:hover) {
  background-color: #4a7dfc;
  border-color: #4a7dfc;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #606266;
  border-color: #dcdfe6;
  background: #fff;
}

.clear-btn:hover {
  color: #f56c6c;
  border-color: #f56c6c;
  background: #fef0f0;
}

.qrcode-box {
  text-align: center;
  padding: 12px;
}

@media (max-width: 768px) {
  .float-tools {
    right: 16px;
    bottom: 30px;
  }
  
  .tool-text {
    display: none;
  }
  
  .tool-button {
    padding: 10px;
  }
}
</style>

