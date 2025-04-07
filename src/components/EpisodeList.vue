<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  episodeList: {
    type: Array,
    default: () => []
  },
  activeEpisode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-episode'])

const selectedSource = ref(0)

const selectEpisode = (episode) => {
  emit('select-episode', episode)
}


// 寻找当前活跃剧集所在的来源
watch(() => props.activeEpisode, (newValue) => {
  if (newValue && props.episodeList.length > 0) {
    for (let i = 0; i < props.episodeList.length; i++) {
      const source = props.episodeList[i]
      const index = source.episodes.findIndex(ep => ep.id === newValue.id)
      if (index !== -1) {
        selectedSource.value = i
        break
      }
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="episode-list-container">
    <div v-if="episodeList.length === 0" class="empty-episodes">
      <el-empty description="暂无剧集信息" :image-size="80" />
    </div>
    <template v-else>
      <!-- 如果有多个来源，显示来源选择标签页 -->
      <el-tabs v-if="episodeList.length > 1" v-model="selectedSource" class="episode-tabs">
        <el-tab-pane
          v-for="(source, index) in episodeList"
          :key="index"
          :label="source.name"
          :name="index"
        >
          <div class="episodes-scroll">
            <div
              v-for="(episode, epIndex) in source.episodes"
              :key="epIndex"
              @click="selectEpisode(episode)"
              class="episode-item"
              :class="{'is-active': activeEpisode && activeEpisode.id === episode.id}"
            >
              <div class="episode-name">{{ episode.name }}</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <!-- 如果只有一个来源，直接显示剧集 -->
      <div v-else class="episodes-scroll">
        <div
          v-for="(episode, index) in episodeList[0].episodes"
          :key="index"
          @click="selectEpisode(episode)"
          class="episode-item"
          :class="{'is-active': activeEpisode && activeEpisode.id === episode.id}"
        >
          <div class="episode-name">{{ episode.name }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.episode-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-episodes {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.episode-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.episode-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.episode-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.episodes-scroll {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.episode-item {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f5f7fa;
  border-left: 3px solid transparent;
}

.episode-item:hover {
  background-color: #edf1f6;
}

.episode-item.is-active {
  background-color: #ecf5ff;
  border-left-color: #409EFF;
  color: #409EFF;
}

.episode-name {
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 自定义滚动条样式 */
.episodes-scroll::-webkit-scrollbar {
  width: 6px;
}

.episodes-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.episodes-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.episodes-scroll::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style> 