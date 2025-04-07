<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDateService } from "@/api/Bangumi.js"

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const animeInfo = ref(null)

const fetchAnimeDetail = async () => {
  const id = route.query.id
  if (!id) {
    ElMessage.error('参数错误')
    router.push('/')
    return
  }

  try {
    loading.value = true
    const response = await getDateService(id)
    if (response.code === 200 && response.data) {
      animeInfo.value = response.data
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

const playEpisode = (id) => {
  // TODO: 实现播放功能
  router.push({
    name: 'player',
    query: { id }
  })
}

onMounted(() => {
  fetchAnimeDetail()
})

// Calculate maximum vote count for scaling
const maxVoteCount = computed(() => {
  if (!animeInfo.value || !animeInfo.value.rating || !animeInfo.value.rating.count) {
    return 0;
  }
  const counts = Object.values(animeInfo.value.rating.count);
  return Math.max(...counts);
});

// Function to calculate bar height based on score
const calculateBarHeight = (score) => {
  if (!animeInfo.value || !animeInfo.value.rating || !animeInfo.value.rating.count || maxVoteCount.value === 0) {
    return 0;
  }
  const count = animeInfo.value.rating.count[score] || 0;
  // Calculate percentage height, ensure it's at least 1% for visibility if count > 0
  const height = (count / maxVoteCount.value) * 100;
  return count > 0 ? Math.max(height, 1) : 0;
};
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
            <img :src="animeInfo.images.large" class="anime-cover" alt="封面">
          </div>
          <div class="anime-info">
            <div class="anime-header">
              <h1 class="anime-title">{{ animeInfo.name_cn || animeInfo.name }}</h1>
              <div class="anime-score" v-if="animeInfo.rating">
                <el-rate
                  :model-value="animeInfo.rating.score / 2"
                  disabled
                  text-color="#ff9900"
                />
                <span class="score-text">{{ animeInfo.rating.score }}</span>
                <span class="rank-text">排名: {{ animeInfo.rating.rank }}</span>
              </div>
            </div>

            <!-- 标签信息 -->
            <div class="anime-categories mb-2">
              <el-tag
                v-for="(tag, index) in animeInfo.meta_tags"
                :key="index"
                class="category-tag"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>

            <!-- 收藏信息 -->
            <div class="collection-info mb-2">
              <el-tag type="success" size="small">
                想看: {{ animeInfo.collection.wish }}
              </el-tag>
              <el-tag type="primary" size="small">
                在看: {{ animeInfo.collection.doing }}
              </el-tag>
              <el-tag type="warning" size="small">
                看过: {{ animeInfo.collection.collect }}
              </el-tag>
              <el-tag type="info" size="small">
                搁置: {{ animeInfo.collection.on_hold }}
              </el-tag>
              <el-tag type="danger" size="small">
                抛弃: {{ animeInfo.collection.dropped }}
              </el-tag>
            </div>

            <!-- 基本信息 -->
            <div class="anime-meta mb-2">
              <div class="meta-item" v-if="animeInfo.date">
                <strong>放送日期：</strong>
                <span>{{ animeInfo.date }}</span>
              </div>
              <div class="meta-item" v-if="animeInfo.platform">
                <strong>平台：</strong>
                <span>{{ animeInfo.platform }}</span>
              </div>
              <div class="meta-item" v-if="animeInfo.eps">
                <strong>集数：</strong>
                <span>{{ animeInfo.eps }}</span>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="anime-infobox mb-2">
              <el-collapse>
                <el-collapse-item title="详细信息">
                  <div class="infobox-content">
                    <div v-for="(item, index) in animeInfo.infobox" :key="index" class="infobox-item">
                      <strong>{{ item.key }}：</strong>
                      <span v-if="Array.isArray(item.value)">
                        {{ item.value.map(v => v.v).join('、') }}
                      </span>
                      <span v-else>{{ item.value }}</span>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- 简介 -->
            <div class="anime-summary mb-4">
              <h3>简介</h3>
              <p>{{ animeInfo.summary }}</p>
            </div>
            <div class="">
              <el-button @click="playEpisode(animeInfo.id)">观看</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 评分分布 -->
      <el-card class="rating-card mb-4" v-if="animeInfo.rating && animeInfo.rating.total > 0">
        <template #header>
          <div class="card-header">
            <h2>评分分布</h2>
            <span class="total-votes">总票数: {{ animeInfo.rating.total }}</span>
          </div>
        </template>
        <div class="rating-chart">
          <div class="bar-container" v-for="score in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]" :key="score">
            <div class="bar" :style="{ height: calculateBarHeight(score) + '%' }"></div>
            <span class="score-label">{{ score }}</span>
          </div>
        </div>
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

.collection-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rank-text {
  margin-left: 0.5rem;
  color: #909399;
  font-size: 0.9rem;
}

.infobox-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.infobox-item {
  margin-bottom: 0.5rem;
}

.total-votes {
  color: #909399;
  font-size: 0.9rem;
}

.rating-chart {
  display: flex;
  align-items: flex-end; /* Bars align at the bottom */
  justify-content: space-around; /* Distribute bars evenly */
  height: 150px; /* Adjust height as needed */
  padding: 1rem 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 1rem;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  flex: 1;
  position: relative; /* For bar positioning */
}

.bar {
  width: 60%; /* Adjust bar width */
  background-color: #a0a0a0; /* Default bar color */
  border-radius: 2px 2px 0 0; /* Slightly rounded top */
  transition: height 0.3s ease-in-out;
  position: absolute; /* Position relative to container */
  bottom: 20px; /* Position above the label */
  left: 20%; /* Center the bar */
}

/* Highlight score 5 if needed (example) */
.bar-container:nth-child(6) .bar { /* 10, 9, 8, 7, 6, 5 -> 6th child */
  background-color: #409EFF; /* Highlight color */
}

.score-label {
  position: absolute; /* Position below the bar */
  bottom: 0;
  font-size: 0.8rem;
  color: #606266;
}
</style>

<script>
// Remove or comment out getScoreColor if not used elsewhere
/*
const getScoreColor = (score) => {
  const colors = {
    1: '#F56C6C',
    2: '#F56C6C',
    3: '#F56C6C',
    4: '#F56C6C',
    5: '#E6A23C',
    6: '#E6A23C',
    7: '#67C23A',
    8: '#67C23A',
    9: '#67C23A',
    10: '#67C23A'
  }
  return colors[score] || '#909399'
}
*/
</script>