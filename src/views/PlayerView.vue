<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVideoUrlService, getEpisodeListService } from "@/api/Bangumi.js"
import EpisodeList from '@/components/EpisodeList.vue'

const route = useRoute()
const router = useRouter()
const videoUrl = ref('https://play.xfvod.pro/temp/2407/%E8%B4%A5%E5%8C%9701z.mp4')
const title = ref('')
const loading = ref(true)
const episodeList = ref([])
const activeEpisode = ref(null)
const episodeLoading = ref(false)

const fetchVideoUrl = async (id, episodeTitle) => {
  if (!id) return

  try {
    loading.value = true
    const response = await getVideoUrlService(id)
    if (response.code === 200 && response.data) {
      videoUrl.value = response.data.url || ''
      title.value = episodeTitle || '视频播放'
      if (!videoUrl.value) {
        ElMessage.warning('视频链接为空')
      }
    } else {
      ElMessage.error('获取视频链接失败')
    }
  } catch (error) {
    console.error('获取视频链接失败:', error)
    ElMessage.error('获取视频链接失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const fetchEpisodeList = async (animeId) => {
  if (!animeId) return
  
  try {
    episodeLoading.value = true
    const response = await getEpisodeListService(animeId)
    if (response.code === 200 && response.data) {
      // 处理新的数据结构
      const episodes = response.data.data || []
      if (episodes.length > 0) {
        // 将剧集按来源分组，这里只有一个来源
        episodeList.value = [{
          name: '默认来源',
          episodes: episodes.map(ep => ({
            id: ep.id,
            name: `${ep.ep} ${ep.name_cn || ep.name}`,
            animeName: route.query.title || '',
            ep: ep.ep
          }))
        }]
      }
    } else {
      ElMessage.error('获取剧集列表失败')
    }
  } catch (error) {
    console.error('获取剧集失败:', error)
    ElMessage.error('获取剧集失败，请稍后重试')
  } finally {
    episodeLoading.value = false
  }
}

const handleEpisodeSelect = (episode) => {
  activeEpisode.value = episode
  fetchVideoUrl(episode.id, `${episode.animeName || ''} - ${episode.name}`)
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  const id = route.query.id
  const animeId = route.query.animeId
  
  if (!id || !animeId) {
    ElMessage.error('参数错误')
    router.push('/')
    return
  }

  // 获取剧集列表
  await fetchEpisodeList(animeId)
  
  // 初始化当前选中剧集
  if (episodeList.value.length > 0 && episodeList.value[0].episodes.length > 0) {
    const currentEpisode = episodeList.value[0].episodes.find(ep => ep.id === id)
    if (currentEpisode) {
      activeEpisode.value = currentEpisode
      const episodeTitle = `${currentEpisode.animeName || ''} - ${currentEpisode.name}`
      fetchVideoUrl(id, episodeTitle)
    } else {
      // 如果找不到当前剧集，使用第一个剧集
      activeEpisode.value = episodeList.value[0].episodes[0]
      const episodeTitle = `${activeEpisode.value.animeName || ''} - ${activeEpisode.value.name}`
      fetchVideoUrl(activeEpisode.value.id, episodeTitle)
    }
  } else {
    // 如果没有剧集列表，直接获取视频
    fetchVideoUrl(id, route.query.title || '视频播放')
  }
})
</script>

<template>
  <div class="player-page">
    <el-card class="player-card">
      <template #header>
        <div class="card-header">
          <h2>{{ title }}</h2>
          <el-button @click="goBack" text>返回</el-button>
        </div>
      </template>

      <div class="player-content">
        <!-- 播放器区域 -->
        <div class="player-main">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="10" animated />
          </div>
          
          <div v-else-if="videoUrl" class="video-container">
            <video 
              controls 
              autoplay 
              class="video-player" 
              :src="videoUrl"
            >
              您的浏览器不支持 HTML5 视频播放
            </video>
          </div>
          
          <div v-else class="error-container">
            <el-empty description="无法获取视频播放地址" />
            <el-button type="primary" @click="goBack" class="mt-4">返回</el-button>
          </div>
        </div>

        <!-- 剧集列表区域 -->
        <div class="player-sidebar" v-loading="episodeLoading">
          <h3 class="sidebar-title">剧集列表</h3>
          <EpisodeList 
            :episode-list="episodeList" 
            :active-episode="activeEpisode"
            @select-episode="handleEpisodeSelect"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.player-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.player-card {
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-content {
  display: flex;
  min-height: 500px;
}

.player-main {
  flex: 1;
  min-width: 0; /* 解决flex元素内容溢出问题 */
}

.player-sidebar {
  width: 280px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ebeef5;
}

.loading-container,
.error-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.video-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 宽高比 */
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.mt-4 {
  margin-top: 1rem;
}

@media (max-width: 992px) {
  .player-content {
    flex-direction: column;
  }
  
  .player-sidebar {
    width: 100%;
    margin-left: 0;
    margin-top: 20px;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .player-page {
    padding: 1rem;
  }
}
</style> 