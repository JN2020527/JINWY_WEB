<template>
  <div class="app-container">
    <Header 
      :show-tabs="!showPaperCenter && ['prep-paper', 'homework', 'analysis', 'school', 'my'].includes(currentLeftMenu)"
      :current-tab="currentTab"
      :current-menu="currentLeftMenu"
      @tab-change="currentTab = $event"
    />
    <div class="main-wrapper">
      <LeftNav 
        :collapsed="leftNavCollapsed" 
        :current-menu="showPaperCenter ? -1 : currentLeftMenu"
        @toggle="leftNavCollapsed = !leftNavCollapsed"
        @menu-change="handleMenuChange"
      />
      <div class="content-wrapper" :class="{ 'nav-collapsed': leftNavCollapsed }">
        <!-- 组卷中心 - 独立页面，不属于任何菜单 -->
        <PaperCenter 
          v-if="showPaperCenter"
          :paperConfig="paperCenterConfig"
          @back="handleBackFromPaperCenter"
          @save="handleSavePaper"
        />
        
        <!-- 正常菜单内容 -->
        <template v-else>
          <Home v-if="currentLeftMenu === 'home'" />
          <DigitalLibrary v-else-if="currentLeftMenu === 'digital-library'" ref="digitalLibraryRef" @goto-paper-center="handleGotoPaperCenter" />
          <PlatformSharing v-else-if="currentLeftMenu === 'prep-plan'" ref="platformSharingRef" @goto-paper-center="handleGotoPaperCenter" />
          <PrepareResource v-else-if="currentLeftMenu === 'prep-resource'" />
          <SmartPaper v-else-if="currentLeftMenu === 'prep-paper'" :current-tab="currentTab" @goto-paper-center="handleGotoPaperCenter" />
          <HomeworkManage v-else-if="currentLeftMenu === 'homework'" :current-tab="currentTab" />
          <SituationAnalysis v-else-if="currentLeftMenu === 'analysis'" :current-tab="currentTab" />
          <SchoolManage v-else-if="currentLeftMenu === 'school'" :current-tab="currentTab" />
          <MyCenter v-else-if="currentLeftMenu === 'my'" :current-tab="currentTab" />
          <div v-else class="empty-content">
            <p>{{ getMenuName(currentLeftMenu) }}</p>
          </div>
        </template>
      </div>
    </div>
    <FloatTools />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Header from './components/Header.vue'
import LeftNav from './components/LeftNav.vue'
import Home from './components/Home.vue'
import DigitalLibrary from './components/DigitalLibrary.vue'
import PlatformSharing from './components/PlatformSharing.vue'
import PrepareResource from './components/PrepareResource.vue'
import HomeworkManage from './components/HomeworkManage.vue'
import SituationAnalysis from './components/SituationAnalysis.vue'
import SmartPaper from './components/SmartPaper.vue'
import SchoolManage from './components/SchoolManage.vue'
import MyCenter from './components/MyCenter.vue'
import FloatTools from './components/FloatTools.vue'
import PaperCenter from './components/PaperCenter.vue'

const leftNavCollapsed = ref(false)
const currentLeftMenu = ref('home') // 当前选中的左侧菜单，默认选中"首页"
const currentTab = ref(0) // 当前选中的顶部tab

// 组件引用
const digitalLibraryRef = ref(null)
const platformSharingRef = ref(null)

// 组卷中心相关状态
const showPaperCenter = ref(false)
const paperCenterConfig = ref(null)
const previousMenuState = ref({ menu: 'home', tab: 0 }) // 保存进入组卷中心前的菜单状态

const menuMap = {
  'home': '首页',
  'digital-library': '数字图书',
  'prep-plan': '备考方案',
  'prep-resource': '备考资源',
  'prep-paper': '备考组卷',
  'homework': '作业管理',
  'analysis': '学情分析',
  'school': '学校管理',
  'my': '我的'
}

const getMenuName = (key) => {
  return menuMap[key] || '未知菜单'
}

const handleMenuChange = (menuKey) => {
  // 如果在组卷中心，点击菜单时先关闭组卷中心
  if (showPaperCenter.value) {
    showPaperCenter.value = false
    paperCenterConfig.value = null
  }
  
  // 如果点击的是当前已选中的菜单
  if (currentLeftMenu.value === menuKey) {
    // 如果是数字图书，重置其状态
    if (menuKey === 'digital-library' && digitalLibraryRef.value) {
      digitalLibraryRef.value.resetState()
      ElMessage.success('已重置数字图书页面')
    }
    // 如果是备考方案，重置其状态
    else if (menuKey === 'prep-plan' && platformSharingRef.value) {
      platformSharingRef.value.resetState()
      ElMessage.success('已重置备考方案页面')
    }
    return
  }
  
  currentLeftMenu.value = menuKey
  // 切换菜单时，重置tab为第一个
  currentTab.value = 0
}

// 处理跳转到组卷中心
const handleGotoPaperCenter = (data) => {
  console.log('跳转到组卷中心，携带数据：', data)
  
  // 保存当前菜单状态
  previousMenuState.value = {
    menu: currentLeftMenu.value,
    tab: currentTab.value
  }
  
  // 设置组卷中心数据并显示
  paperCenterConfig.value = {
    catalogName: data.catalogName,
    questions: data.questions
  }
  showPaperCenter.value = true
}

// 从组卷中心返回
const handleBackFromPaperCenter = () => {
  showPaperCenter.value = false
  paperCenterConfig.value = null
  
  // 恢复之前的菜单状态
  currentLeftMenu.value = previousMenuState.value.menu
  currentTab.value = previousMenuState.value.tab
}

// 保存试卷
const handleSavePaper = (paperData) => {
  console.log('保存试卷数据:', paperData)
  // TODO: 调用保存试卷接口
  ElMessage.success('试卷保存成功！')
  
  showPaperCenter.value = false
  paperCenterConfig.value = null
  
  // 恢复之前的菜单状态
  currentLeftMenu.value = previousMenuState.value.menu
  currentTab.value = previousMenuState.value.tab
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

