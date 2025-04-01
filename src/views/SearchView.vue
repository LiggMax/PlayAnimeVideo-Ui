<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getAnimeDateService, searchService } from "@/api/Anime.js";

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
    if (response.code === 200 && response.data && response.data.length > 0) {
      searchResults.value = response.data
    } else {
      searchResults.value = []
      ElMessage.info('未找到相关动漫')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const openEpisode = (detailUrl) => {
  router.push({
    name: 'detail',
    query: { url: detailUrl }
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
        <el-skeleton :rows="6" animated />
      </el-col>
    </el-row>

    <template v-else-if="searchResults.length > 0">
      <!-- 搜索结果数量 -->
      <div class="search-result-count mb-4">
        找到 {{ searchResults.length }} 条结果
      </div>

      <!-- 动漫列表 -->
      <div class="anime-list">
        <el-card v-for="(anime, index) in searchResults" :key="index" class="anime-card mb-4">
          <div class="anime-detail">
            <div class="anime-cover-container">
              <img :src="anime.cover" class="anime-cover" alt="封面">
            </div>
            <div class="anime-info">
              <h2 class="anime-title">{{ anime.title }}</h2>
              
              <div class="anime-categories mb-2">
                <el-tag 
                  v-for="(category, catIndex) in anime.categories" 
                  :key="catIndex"
                  class="category-tag"
                  type="info"
                  effect="plain"
                >
                  {{ category }}
                </el-tag>
              </div>
              
              <div class="anime-meta mb-2">
                <span class="meta-item"><strong>地区:</strong> {{ anime.area }}</span>
                <span class="meta-item"><strong>年份:</strong> {{ anime.year }}</span>
              </div>
              
              <div class="anime-summary mb-4">
                <p>{{ anime.summary }}</p>
              </div>
              
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  @click="openEpisode(anime.detailUrl)"
                >
                  观看
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
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

.search-result-count {
  font-size: 1rem;
  color: #606266;
  margin-bottom: 1.5rem;
}

.anime-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.anime-card {
  transition: transform 0.2s;
}

.anime-card:hover {
  transform: translateY(-3px);
}

/* 动漫详情卡片样式 */
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

.anime-meta {
  margin-bottom: 1rem;
}

.meta-item {
  margin-right: 1.5rem;
  color: #606266;
}

.anime-summary {
  color: #606266;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}
</style> 