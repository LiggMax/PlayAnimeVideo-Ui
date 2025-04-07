<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { searchService } from "@/api/Anime.js";

const router = useRouter()
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
    const response = await searchService(searchQuery.value)
    if (response.code === 200 && response.data) {
      searchResults.value = response.data
    } else {
      ElMessage.error('获取数据失败：' + response.message)
      searchResults.value = []
    }
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const openDetail = (url) => {
  router.push({
    name: 'detail',
    query: { url }
  })
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
        <el-skeleton :rows="5" animated />
      </el-col>
    </el-row>

    <el-row v-else-if="searchResults.length > 0">
      <el-col :span="24">
        <el-card class="search-results-card">
          <template #header>
            <div class="results-header">
              <span>搜索结果 ({{ searchResults.length }})</span>
            </div>
          </template>
          
          <div class="anime-list">
            <el-card 
              v-for="item in searchResults" 
              :key="item.id"
              class="anime-item"
              shadow="hover"
            >
              <div class="anime-content">
                <div class="anime-cover-container" @click="openDetail(item.detailUrl)">
                  <img :src="item.cover" class="anime-cover" alt="封面">
                </div>
                <div class="anime-info">
                  <h3 class="anime-title" @click="openDetail(item.detailUrl)">{{ item.title }}</h3>
                  
                  <!-- 分类标签 -->
                  <div class="anime-categories" v-if="item.categories && item.categories.length">
                    <el-tag 
                      v-for="(category, index) in item.categories" 
                      :key="index"
                      size="small"
                      class="category-tag"
                      effect="plain"
                    >
                      {{ category }}
                    </el-tag>
                  </div>
                  
                  <!-- 元数据信息 -->
                  <div class="meta-info">
                    <span v-if="item.year" class="year">
                      <i class="el-icon-calendar"></i> {{ item.year }}
                    </span>
                    <span v-if="item.area" class="area">
                      <i class="el-icon-location"></i> {{ item.area }}
                    </span>
                  </div>
                  
                  <!-- 简介 -->
                  <p class="anime-desc">{{ item.summary }}</p>
                  
                  <!-- 操作按钮 -->
                  <div class="anime-actions">
                    <el-button 
                      type="primary" 
                      size="small"
                      @click="openDetail(item.detailUrl)"
                    >
                      观看
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row v-else-if="searchQuery" class="mb-4">
      <el-col :span="24" class="text-center">
        <el-empty description="未找到相关动漫" />
      </el-col>
    </el-row>

    <el-row class="mt-4">
      <el-col :span="24" class="text-center">
        <el-button @click="$router.push('/')">返回首页</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.search-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.text-center {
  text-align: center;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
}

.search-results-card {
  margin-bottom: 1.5rem;
}

.results-header {
  font-size: 1.2rem;
  font-weight: 500;
}

.anime-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.anime-item {
  transition: transform 0.2s;
}

.anime-item:hover {
  transform: translateY(-2px);
}

.anime-content {
  display: flex;
  gap: 1.5rem;
}

.anime-cover-container {
  flex-shrink: 0;
  width: 120px;
  height: 160px;
  cursor: pointer;
}

.anime-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.anime-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.anime-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #303133;
  cursor: pointer;
}

.anime-title:hover {
  color: #409EFF;
  text-decoration: underline;
}

.anime-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.category-tag {
  margin-right: 0.25rem;
}

.meta-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #909399;
}

.anime-desc {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.anime-actions {
  margin-top: auto;
}

@media (max-width: 768px) {
  .anime-content {
    flex-direction: column;
  }
  
  .anime-cover-container {
    width: 100%;
    height: 200px;
    margin-bottom: 1rem;
  }
}
</style> 