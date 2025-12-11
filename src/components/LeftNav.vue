<template>
  <div class="left-nav" :class="{ collapsed }">
    <!-- 学段学科选择器 -->
    <div class="grade-selector">
      <el-popover placement="bottom-start" :width="360" trigger="click">
        <template #reference>
          <div class="grade-choose">
            <div class="grade-text">
              {{ currentStage }} * {{ currentSubject }}
            </div>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </div>
        </template>
        <div class="grade-list">
          <div class="select-row">
            <div class="label">学段：</div>
            <div class="options">
              <div 
                v-for="stage in stages" 
                :key="stage"
                :class="['option-item', { active: currentStage === stage }]"
                @click="currentStage = stage"
              >
                {{ stage }}
              </div>
            </div>
          </div>
          <div class="select-row">
            <div class="label">学科：</div>
            <div class="options">
              <div 
                v-for="subject in subjects" 
                :key="subject"
                :class="['option-item', { active: currentSubject === subject }]"
                @click="currentSubject = subject"
              >
                {{ subject }}
              </div>
            </div>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 功能菜单 -->
    <ul class="nav-list">
      <li 
        v-for="(item, index) in menuItems" 
        :key="index"
        :class="['nav-item', { active: props.currentMenu === item.key }]"
        @click="handleMenuClick(item.key)"
      >
        <el-icon class="nav-icon">
          <component :is="item.icon" />
        </el-icon>
        <div class="nav-text" v-if="!collapsed">{{ item.label }}</div>
      </li>
    </ul>

    <!-- 收起按钮 -->
    <div class="toggle-btn" @click="$emit('toggle')" v-if="!collapsed">
      <el-icon><ArrowLeft /></el-icon>
      <span>收起导航</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Reading, EditPen, List, DataAnalysis, 
  DocumentCopy, OfficeBuilding, User, ArrowDown, ArrowLeft, Collection, House
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: Boolean,
  currentMenu: {
    type: String,
    default: 'home'
  }
})

const emit = defineEmits(['toggle', 'menuChange'])

const currentStage = ref('初中')
const currentSubject = ref('英语')

const handleMenuClick = (key) => {
  emit('menuChange', key)
}

const stages = ['初中']
const subjects = ['语文', '数学', '英语', '物理', '化学', '道德与法治', '历史', '生物学', '地理']

const menuItems = [
  { key: 'home', label: '首页', icon: House },
  { key: 'digital-library', label: '数字图书', icon: Collection },
  { key: 'prep-plan', label: '备考方案', icon: Reading },
  { key: 'prep-resource', label: '备考资源', icon: EditPen },
  { key: 'prep-paper', label: '备考组卷', icon: DocumentCopy },
  { key: 'homework', label: '作业管理', icon: List },
  { key: 'analysis', label: '学情分析', icon: DataAnalysis },
  { key: 'school', label: '学校管理', icon: OfficeBuilding },
  { key: 'my', label: '我的', icon: User }
]
</script>

<style scoped>
.left-nav {
  width: 260px;
  background: transparent;
  border-right: 1px solid rgba(228, 231, 237, 0.3);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 72px;
  bottom: 0;
  transition: all 0.3s;
  z-index: 999;
}

.left-nav.collapsed {
  width: 64px;
}

.grade-selector {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(228, 231, 237, 0.3);
}

.grade-choose {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 10px;
  background: #D9E8FD;
  border: 1px solid rgba(220, 223, 230, 0.6);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  gap: 8px;
}

.grade-choose:hover {
  border-color: #2262FB;
  background: #D9E8FD;
}

.grade-text {
  font-size: 13px;
  color: #2262FB;
  font-weight: 600;
}

.arrow-icon {
  color: #2262FB;
}

.grade-list {
  padding: 12px 0;
}

.select-row {
  margin-bottom: 16px;
}

.select-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 6px;
  padding-left: 2px;
  font-weight: 500;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.option-item {
  padding: 5px 10px;
  background: #f4f4f5;
  border-radius: 3px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  background: #e9e9eb;
}

.option-item.active {
  background: #2262FB;
  color: #fff;
  font-weight: 500;
}

.nav-list {
  flex: 1;
  list-style: none;
  padding: 6px 0;
  margin: 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px;
  margin: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  background: transparent;
  font-size: 16px;
}

.nav-item:hover {
  background: rgba(64, 158, 255, 0.06);
  color: #409eff;
}

.nav-item.active {
  background: #2262FB;
  color: #fff;
  box-shadow: 0 2px 8px rgba(34, 98, 251, 0.25);
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  border-top: 1px solid rgba(220, 223, 230, 0.4);
  cursor: pointer;
  color: #909399;
  font-size: 12px;
  transition: all 0.3s;
  background: transparent;
}

.toggle-btn:hover {
  background: rgba(64, 158, 255, 0.08);
  color: #409eff;
}

@media (max-width: 768px) {
  .left-nav {
    transform: translateX(-100%);
  }
  
  .left-nav.show {
    transform: translateX(0);
  }
}
</style>

