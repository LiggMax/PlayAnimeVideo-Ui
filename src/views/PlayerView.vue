<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { getVideoUrlService } from "@/api/Anime.js"

const route = useRoute()
const router = useRouter()
const videoUrl = ref('')
const title = ref('')
const loading = ref(true)

const fetchVideoUrl = async () => {
  const url = route.query.url
  if (!url) {
    ElMessage.error('参数错误')
    await router.push('/')
    return
  }

  title.value = route.query.title || '视频播放'

  try {
    loading.value = true
    const response = await getVideoUrlService(url)
    if (response.code === 200 && response.data && response.data.length > 0) {
      videoUrl.value = response.data[0]
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

onMounted(() => {
  fetchVideoUrl()
})
</script>

<template>
  <div class="player-page">
    <el-card class="player-card">
      <template #header>
        <div class="card-header">
          <h2>{{ title }}</h2>
          <el-button @click="router.back()" text>返回</el-button>
        </div>
      </template>

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
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.player-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.player-card {
  margin-bottom: 2rem;
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

.loading-container,
.error-container {
  min-height: 400px;
  display: flex;
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
</style> 