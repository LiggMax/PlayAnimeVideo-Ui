<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {getCharacterService, getDateService} from "@/api/Bangumi.js"
// 导入播放图标
import PlayIcon from '@/assets/icon/Play.svg'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const animeInfo = ref(null)
const characters = ref([])
const characterLoading = ref(false)
const showAllCharacters = ref(false)

// 计算显示角色信息
const displayedCharacters = computed(() => {
  if (showAllCharacters.value) {
    return characters.value;
  } else {
    return characters.value.slice(0, 6);
  }
});

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
      animeInfo.value = response.data
      // 获取到详情后，加载角色信息
      await fetchCharacters(id)
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const fetchCharacters = async (id) => {
  if (!id) return
  
  try {
    characterLoading.value = true
    const response = await getCharacterService(id)
    characters.value = response.data
        .filter(char => char.relation === '主角' || char.relation === '配角')
  } finally {
    characterLoading.value = false
  }
}

const playEpisode = (id) => {
  router.push({
    name: 'player',
    query: { 
      id: id,  // 视频ID
      animeId: animeInfo.value.id, // 番剧ID，用于获取剧集列表
      title: animeInfo.value.name_cn || animeInfo.value.name // 番剧标题
    }
  })
}

const toggleCharactersDisplay = () => {
  showAllCharacters.value = !showAllCharacters.value;
}

onMounted(() => {
  fetchAnimeDetail()
})
// 计算最大投票数
const maxVoteCount = computed(() => {
  if (!animeInfo.value || !animeInfo.value.rating || !animeInfo.value.rating.count) {
    return 0;
  }
  const counts = Object.values(animeInfo.value.rating.count);
  return Math.max(...counts);
});

const calculateBarHeight = (score) => {
  if (!animeInfo.value || !animeInfo.value.rating || !animeInfo.value.rating.count || maxVoteCount.value === 0) {
    return 0;
  }
  const count = animeInfo.value.rating.count[score] || 0;
  // 计算高度
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
            <div class="play-button-container">
              <el-button 
                @click="playEpisode(animeInfo.id)" 
                type="primary" 
                class="play-button"
                size="large"
              >
                <img src="@/assets/icon/Play.svg" class="play-icon" alt="播放" />
                播放
              </el-button>
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

      <!-- 角色信息 -->
      <el-card class="characters-card mb-4" v-if="characters.length > 0">
        <template #header>
          <div class="card-header">
            <h2>角色信息</h2>
          </div>
        </template>
        <div class="characters-container">
          <div v-if="characterLoading" class="text-center">
            <el-skeleton :rows="3" animated />
          </div>
          <template v-else>
            <div class="characters-grid">
              <div v-for="char in displayedCharacters" :key="char.id" class="character-item">
                <div class="character-image">
                  <img :src="char.images.grid" alt="角色图片">
                </div>
                <div class="character-info">
                  <div class="character-name">{{ char.name }}</div>
                  <div class="character-relation">{{ char.relation }}</div>
                  <div class="character-cv" v-if="char.actors && char.actors.length > 0">
                    CV: {{ char.actors[0].name }}
                  </div>
                </div>
              </div>
            </div>
            <div v-if="characters.length > 6" class="show-more-container">
              <el-button 
                type="primary" 
                plain 
                @click="toggleCharactersDisplay"
                :icon="showAllCharacters ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
              >
                {{ showAllCharacters ? '收起' : '显示更多' }}
              </el-button>
            </div>
          </template>
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

/* 角色信息样式 */
.characters-card {
  background-color: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .characters-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

.character-item {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.3s ease;
  color: #303133;
  border-left: 3px solid #409EFF;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.character-item:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, #409EFF, #53a8ff);
  opacity: 0;
  transition: opacity 0.3s;
}

.character-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(32, 107, 196, 0.15);
  background-color: #edf1f6;
}

.character-item:hover:before {
  opacity: 1;
}

.character-image {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 1rem;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.character-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-info {
  flex-grow: 1;
}

.character-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

.character-relation {
  color: #409EFF;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.character-cv {
  color: #606266;
  font-size: 0.8rem;
}

.characters-container {
  width: 100%;
}

.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

/* 播放按钮样式 */
.play-button-container {
  margin-top: 1.5rem;
}

.play-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 36px;
  border-radius: 50px;
  background: linear-gradient(135deg, #409EFF, #3080E8);
  border: none;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.35);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.play-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
  background: linear-gradient(135deg, #53a8ff, #409EFF);
}

.play-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.4);
}

.play-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}
</style>