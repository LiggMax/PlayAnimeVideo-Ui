<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  try {
    // 这里模拟API调用，实际项目中替换为真实API
    await new Promise(resolve => setTimeout(resolve, 1000))
    searchResults.value = [
      {
        id: 1,
        title: '示例动漫1',
        cover: 'https://via.placeholder.com/200x300',
        description: '这是一个示例动漫描述'
      },
      {
        id: 2,
        title: '示例动漫2',
        cover: 'https://via.placeholder.com/200x300',
        description: '这是另一个示例动漫描述'
      }
    ]
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="search-page">
    <el-row class="mb-4">
      <el-col :span="24">
        <el-input
          v-model="searchQuery"
          placeholder="请输入动漫名称"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch" :loading="loading">
              搜索
            </el-button>
          </template>
        </el-input>
      </el-col>
    </el-row>

    <el-row v-if="loading" class="mb-4">
      <el-col :span="24" class="text-center">
        <el-skeleton :rows="3" animated />
      </el-col>
    </el-row>

    <el-row v-else-if="searchResults.length > 0">
      <el-col 
        v-for="item in searchResults" 
        :key="item.id" 
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="6"
        class="mb-4"
      >
        <el-card class="anime-card" :body-style="{ padding: '0px' }">
          <img :src="item.cover" class="anime-cover">
          <div class="anime-info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row v-else-if="searchQuery" class="mb-4">
      <el-col :span="24" class="text-center">
        <el-empty description="未找到相关动漫" />
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24" class="text-center">
        <el-button @click="$router.push('/')">返回首页</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.search-page {
  padding: 2rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.text-center {
  text-align: center;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
}

.anime-card {
  margin-bottom: 1rem;
  transition: transform 0.3s;
}

.anime-card:hover {
  transform: translateY(-5px);
}

.anime-cover {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.anime-info {
  padding: 1rem;
}

.anime-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.anime-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 