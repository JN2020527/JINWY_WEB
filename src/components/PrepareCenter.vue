<template>
  <div class="prepare-center">
    <div class="prepare-content">
      <div class="tab-content">
        <div class="placeholder-container">
          <p class="placeholder-hint">{{ tabNames[currentTab] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentTab: {
    type: Number,
    default: 0
  }
})

const tabNames = ['数字图书', '备课资源', '我的备课']
</script>

<style scoped>
.prepare-center {
  padding: 20px 24px;
  min-height: 100%;
  background-color: #ffffff;
  border-radius: 5px 0 0 0;
}

.prepare-content {
  width: 100%;
  height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-content {
  width: 100%;
  animation: fadeIn 0.3s;
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

.placeholder-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-hint {
  font-size: 24px;
  color: #909399;
  margin: 0;
}
</style>

