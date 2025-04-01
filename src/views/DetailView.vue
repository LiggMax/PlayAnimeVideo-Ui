<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAnimeDateService } from "@/api/Anime.js"

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const animeInfo = ref(null)
const resourceList = ref([])
const activeTab = ref('0')

const fetchAnimeDetail = async () => {
  const url = route.query.url
  if (!url) {
    ElMessage.error('参数错误')
    router.push('/')
    return
  }

  try {
    loading.value = true
    const response = await getAnimeDateService(url)
    if (response.code === 200 && response.data) {
      animeInfo.value = response.data.animeInfo
      resourceList.value = response.data.resourceList
      if (response.data.resourceList && response.data.resourceList.length > 0) {
        activeTab.value = '0'
      }
    } else {
      ElMessage.error('获取数据失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const playEpisode = (url, name) => {
  router.push({
    name: 'player',
    query: {
      url: url,
      title: `${animeInfo.value.title} - ${name}`
    }
  })
}

onMounted(() => {
  fetchAnimeDetail()
})
</script>

<template>
  <div class="detail-page">
    <el-row v-if="loading" class="mb-4">
      <el-col :span="24" class="text-center">
        <el-skeleton :rows="10" animated />
      </el-col>
    </el-row>

    <template v-else-if="animeInfo">
      <!-- 动漫信息卡片 -->
      <el-card class="anime-info-card mb-4">
        <div class="anime-detail">
          <div class="anime-cover-container">
            <img :src="animeInfo.cover" class="anime-cover" alt="封面">
          </div>
          <div class="anime-info">
            <div class="anime-header">
              <h1 class="anime-title">{{ animeInfo.title }}</h1>
              <div class="anime-score" v-if="animeInfo.score">
                <el-rate
                  :model-value="Number(animeInfo.score) / 2"
                  disabled
                  text-color="#ff9900"
                />
                <span class="score-text">{{ animeInfo.score }}</span>
              </div>
            </div>

            <div class="anime-categories mb-2">
              <el-tag
                v-for="(category, index) in animeInfo.categories"
                :key="index"
                class="category-tag"
                type="info"
                effect="plain"
              >
                {{ category }}
              </el-tag>
            </div>

            <div class="anime-meta mb-2">
              <div class="meta-item">
                <strong>地区：</strong>
                <span>{{ animeInfo.area }}</span>
              </div>
              <div class="meta-item">
                <strong>年份：</strong>
                <span>{{ animeInfo.year }}</span>
              </div>
              <div class="meta-item" v-if="animeInfo.views">
                <strong>播放量：</strong>
                <span>{{ animeInfo.views }}</span>
              </div>
            </div>

            <div class="anime-staff mb-2" v-if="animeInfo.directors && animeInfo.directors.length">
              <div class="meta-item">
                <strong>导演：</strong>
                <span>{{ animeInfo.directors.join('、') }}</span>
              </div>
            </div>

            <div class="anime-staff mb-2" v-if="animeInfo.actors && animeInfo.actors.length">
              <div class="meta-item">
                <strong>演员：</strong>
                <span>{{ animeInfo.actors.join('、') }}</span>
              </div>
            </div>

            <div class="anime-summary mb-4">
              <p>{{ animeInfo.summary }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 剧集列表 -->
      <el-card class="episodes-card">
        <template #header>
          <div class="card-header">
            <h2>剧集列表</h2>
          </div>
        </template>
        
        <el-tabs v-model="activeTab">
          <el-tab-pane
            v-for="(resource, index) in resourceList"
            :key="index"
            :label="resource.name"
            :name="String(index)"
          >
            <div class="">
              <el-button
                v-for="episode in resource.episodes"
                :key="episode.url"
                @click="playEpisode(episode.url, episode.name)"
                type="primary"
                plain
              >
                {{ episode.name }}
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>

    <el-row v-else class="mb-4">
      <el-col :span="24" class="text-center">
        <el-empty description="未找到相关信息" />
      </el-col>
    </el-row>

    <el-row class="mt-4">
      <el-col :span="24" class="text-center">
        <el-button @click="router.back()">返回</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.detail-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
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

/* 动漫信息卡片样式 */
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
  max-width: 300px;
  margin: 0 auto 1rem auto;
}

@media (min-width: 768px) {
  .anime-cover-container {
    margin: 0 2rem 0 0;
  }
}

.anime-cover {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.anime-info {
  flex: 1;
}

.anime-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.anime-title {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
}

.anime-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-text {
  color: #ff9900;
  font-size: 1.2rem;
  font-weight: bold;
}

.category-tag {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.anime-meta, .anime-staff {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  color: #606266;
}

.meta-item strong {
  color: #303133;
}

.anime-summary {
  color: #606266;
  line-height: 1.6;
}

/* 剧集列表样式 */
.episodes-card {
  margin-top: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.episodes-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-top: 1rem;
  padding: 0 12px;
}

</style>