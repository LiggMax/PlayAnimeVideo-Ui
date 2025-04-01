<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {searchService} from "@/api/Search.js";

const searchQuery = ref('')
const searchResults = ref(null)
const loading = ref(false)
const activeTabName = ref('0')

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  try {
    const results = await searchService(searchQuery.value)
    searchResults.value = results.data
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openEpisode = (url) => {
  window.open(url, '_blank')
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
        <el-skeleton :rows="6" animated />
      </el-col>
    </el-row>

    <template v-else-if="searchResults">
      <!-- 动漫详情卡片 -->
      <el-card class="anime-detail-card mb-4">
        <div class="anime-detail">
          <div class="anime-cover-container">
            <img :src="searchResults.cover" class="anime-cover" alt="封面">
          </div>
          <div class="anime-info">
            <h2 class="anime-title">{{ searchResults.title }}</h2>
            
            <div class="anime-categories mb-2">
              <el-tag 
                v-for="(category, index) in searchResults.categories" 
                :key="index"
                class="category-tag"
                type="info"
                effect="plain"
              >
                {{ category }}
              </el-tag>
            </div>
            
            <div class="anime-summary mb-4">
              <p>{{ searchResults.summary }}</p>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 剧集列表 -->
      <el-card class="episodes-card mb-4">
        <template #header>
          <div class="episodes-header">
            <h3>剧集列表</h3>
          </div>
        </template>
        
        <el-tabs v-model="activeTabName" class="episodes-tabs">
          <el-tab-pane 
            v-for="(source, index) in searchResults.episodes" 
            :key="index"
            :label="source.name"
            :name="String(index)"
          >
            <div class="episodes-grid">
              <el-button
                v-for="episode in source.episodes"
                :key="episode.name"
                class="episode-button"
                type="primary"
                plain
                @click="openEpisode(episode.url)"
              >
                {{ episode.name }}
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>

    <el-row v-else-if="searchQuery && !loading" class="mb-4">
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

.mb-2 {
  margin-bottom: 0.5rem;
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

/* 动漫详情卡片样式 */
.anime-detail-card {
  margin-bottom: 2rem;
}

.anime-detail {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .anime-detail {
    flex-direction: row;
  }
}

.anime-cover-container {
  flex-shrink: 0;
  width: 100%;
  max-width: 200px;
  margin: 0 auto 1rem auto;
}

@media (min-width: 768px) {
  .anime-cover-container {
    margin: 0 2rem 0 0;
  }
}

.anime-cover {
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.anime-info {
  flex: 1;
}

.anime-title {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #303133;
}

.category-tag {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.anime-summary {
  color: #606266;
  line-height: 1.6;
}

/* 剧集列表样式 */
.episodes-card {
  margin-bottom: 2rem;
}

.episodes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.episodes-header h3 {
  margin: 0;
  color: #303133;
}

.episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 1rem;
}

.episode-button {
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style> 