<script setup>
</script>

<template>
  <div class="home">
    <el-row class="mb-4">
      <el-col :span="24" class="text-center">
        <h1>动漫视频播放器</h1>
      </el-col>
    </el-row>
    
    <el-row class="mb-4">
      <el-col :span="24" class="text-center">
        <el-button type="primary" @click="$router.push('/search')">
          开始搜索动漫
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem;
}

.text-center {
  text-align: center;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

h1 {
  color: #409EFF;
  margin-bottom: 2rem;
}
</style> 