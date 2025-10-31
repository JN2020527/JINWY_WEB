<template>
  <div class="app-container">
    <Header 
      :show-tabs="currentLeftMenu >= 2 && currentLeftMenu <= 6"
      :current-tab="currentTab"
      :current-menu="currentLeftMenu"
      @tab-change="currentTab = $event"
    />
    <div class="main-wrapper">
      <LeftNav 
        :collapsed="leftNavCollapsed" 
        :current-menu="currentLeftMenu"
        @toggle="leftNavCollapsed = !leftNavCollapsed"
        @menu-change="handleMenuChange"
      />
      <div class="content-wrapper" :class="{ 'nav-collapsed': leftNavCollapsed }">
        <PlatformSharing v-if="currentLeftMenu === 0" />
        <PrepareResource v-else-if="currentLeftMenu === 1" />
        <HomeworkManage v-else-if="currentLeftMenu === 2" :current-tab="currentTab" />
        <SituationAnalysis v-else-if="currentLeftMenu === 3" :current-tab="currentTab" />
        <SmartPaper v-else-if="currentLeftMenu === 4" :current-tab="currentTab" />
        <SchoolManage v-else-if="currentLeftMenu === 5" :current-tab="currentTab" />
        <MyCenter v-else-if="currentLeftMenu === 6" :current-tab="currentTab" />
        <div v-else class="empty-content">
          <p>{{ getMenuName(currentLeftMenu) }}</p>
        </div>
      </div>
    </div>
    <FloatTools />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import LeftNav from './components/LeftNav.vue'
import PlatformSharing from './components/PlatformSharing.vue'
import PrepareResource from './components/PrepareResource.vue'
import HomeworkManage from './components/HomeworkManage.vue'
import SituationAnalysis from './components/SituationAnalysis.vue'
import SmartPaper from './components/SmartPaper.vue'
import SchoolManage from './components/SchoolManage.vue'
import MyCenter from './components/MyCenter.vue'
import FloatTools from './components/FloatTools.vue'

const leftNavCollapsed = ref(false)
const currentLeftMenu = ref(0) // 当前选中的左侧菜单，默认选中"备考方案"
const currentTab = ref(0) // 当前选中的顶部tab

const menuNames = ['备考方案', '备课资源', '作业管理', '学情分析', '智能组卷', '学校管理', '我的']

const getMenuName = (index) => {
  return menuNames[index] || '未知菜单'
}

const handleMenuChange = (menuIndex) => {
  currentLeftMenu.value = menuIndex
  // 切换菜单时，重置tab为第一个
  currentTab.value = 0
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  margin-left: 260px;
  overflow-y: auto;
  transition: margin-left 0.3s;
  background-color: transparent;
}

.content-wrapper.nav-collapsed {
  margin-left: 64px;
}

.empty-content {
  padding: 40px;
  text-align: center;
  font-size: 18px;
  color: #909399;
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
  }
}
</style>

