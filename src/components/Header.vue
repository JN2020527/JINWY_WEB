<template>
  <div class="header-container">
    <div class="header-top">
      <div class="header-top-left">
        <div class="logo-box">
          <img src="/logo.png" alt="logo" class="logo-img" />
        </div>
        <ul class="header-nav" v-if="showTabs">
          <li 
            v-for="(item, index) in navItems" 
            :key="index"
            :class="['nav-item', { active: currentTab === index }]"
            @click="handleTabClick(index)"
          >
            <el-icon class="nav-icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </div>
      <div class="header-right">
        <el-dropdown class="year-dropdown">
          <div class="year-box">
            <p class="year-text">{{ currentYear || '暂无默认学年' }}</p>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="year in years" :key="year">{{ year }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <div class="scan-box">
          <img src="@/assets/saomiao.png" alt="扫码" class="scan-img" />
        </div>
        
        <div class="head-avatar">
          <img src="https://sxjwy-img.oss-cn-beijing.aliyuncs.com//sxjwy.png" alt="avatar" />
        </div>
        
        <el-dropdown class="user-dropdown">
          <div class="user-info">
            <span class="user-name">巨文楷</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Share, Document, Tickets, Folder, Reading, FolderOpened, EditPen, Camera, List, RefreshRight, TrendCharts, Histogram, User, Select, Timer, UserFilled, Avatar, ArrowDown, Calendar } from '@element-plus/icons-vue'

const props = defineProps({
  showTabs: {
    type: Boolean,
    default: true
  },
  currentTab: {
    type: Number,
    default: 0
  },
  currentMenu: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['tabChange'])

const currentYear = ref('25-26学年')

// 数字校本的tabs
const digitalTabs = [
  { label: '平台共享', icon: Share },
  { label: '校本试题', icon: Document },
  { label: '校本试卷', icon: Tickets },
  { label: '我的试卷', icon: Folder }
]

// 备课中心的tabs
const prepareTabs = [
  { label: '数字图书', icon: Reading },
  { label: '备课资源', icon: FolderOpened },
  { label: '我的备课', icon: EditPen }
]

// 作业管理的tabs
const homeworkTabs = [
  { label: '作业扫描', icon: Camera },
  { label: '作业列表', icon: List },
  { label: '错题重练', icon: RefreshRight }
]

// 学情分析的tabs
const situationTabs = [
  { label: '年级学情', icon: TrendCharts },
  { label: '班级学情', icon: Histogram },
  { label: '个人学情', icon: User }
]

// 智能组卷的tabs
const smartPaperTabs = [
  { label: '选题组卷', icon: Select },
  { label: '快速组卷', icon: Timer }
]

// 学校管理的tabs
const schoolManageTabs = [
  { label: '用户管理', icon: UserFilled },
  { label: '教师管理', icon: Avatar }
]

// 我的 tabs
const myTabs = [
  { label: '我的备考', icon: Reading },
  { label: '我的备课', icon: EditPen },
  { label: '校本试卷', icon: Document }
]

// 根据当前菜单显示对应的tabs
const navItems = computed(() => {
  // 0: 数字图书 - 无tabs
  // 1: 备考方案 - 无tabs
  // 2: 备考资源 - 无tabs
  // 3: 备考组卷 - 有tabs
  if (props.currentMenu === 3) {
    return smartPaperTabs
  } 
  // 4: 作业管理 - 有tabs
  else if (props.currentMenu === 4) {
    return homeworkTabs
  } 
  // 5: 学情分析 - 有tabs
  else if (props.currentMenu === 5) {
    return situationTabs
  } 
  // 6: 学校管理 - 有tabs
  else if (props.currentMenu === 6) {
    return schoolManageTabs
  } 
  // 7: 我的 - 有tabs
  else if (props.currentMenu === 7) {
    return myTabs
  }
  return []
})

const years = ['25-26学年', '24-25学年', '23-24学年', '22-23学年']

const handleTabClick = (index) => {
  emit('tabChange', index)
}
</script>

<style scoped>
.header-container {
  background: transparent;
  box-shadow: none;
  z-index: 1000;
}

.header-top {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 0 0;
}

.header-top-left {
  display: flex;
  align-items: center;
  gap: 0;
}

.logo-box {
  display: flex;
  align-items: center;
  width: 260px;
  justify-content: center;
}

.logo-img {
  height: 40px;
  width: auto;
}

.header-nav {
  display: flex;
  list-style: none;
  gap: 8px;
  margin: 0;
  padding: 0 0 0 20px;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: #303133;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  background: transparent;
  white-space: nowrap;
  min-height: 36px;
  border-bottom: 2px solid transparent;
}

.nav-item:hover {
  color: #2262FB;
  background: transparent;
}

.nav-item.active {
  color: #2262FB;
  background: transparent;
  font-weight: 500;
  border-bottom: 2px solid #2262FB;
}

.nav-icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.year-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 4px;
  color: #303133;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
  min-height: 36px;
}

.year-box:hover {
  background: #ffffff;
}

.year-text {
  font-size: 16px;
  margin: 0;
}

.scan-box {
  color: #303133;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  background: transparent;
  min-height: 36px;
}

.scan-box:hover {
  background: transparent;
}

.scan-img {
  width: 24px;
  height: 24px;
}

.head-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.25);
}

.head-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #303133;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  background: transparent;
  min-height: 36px;
}

.user-info:hover {
  background: transparent;
}

.user-name {
  font-size: 16px;
}

@media (max-width: 768px) {
  .header-nav {
    display: none;
  }
  
  .scan-box {
    display: none;
  }
}
</style>

