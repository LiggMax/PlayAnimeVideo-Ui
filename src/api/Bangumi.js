import request from "@/utils/request.js";

/**
 * 搜索
 */
export const searchService = (keyword) =>{
    return request.get("/bangumi/search?keyword="+ keyword)
}

/**
 * 视频详情
 */
export const getDateService = (id) =>{
    return request.get("/bangumi/detail?id=" + id)
}

/**
 * 角色信息
 */
export const getCharacterService = (id) =>{
    return request.get("/bangumi/character?id=" + id)
}

/**
 * 获取剧集列表
 */
export const getEpisodeListService = (id) =>{
    return request.get("/bangumi/episode?id=" + id)
}

/**
 * 获取视频播放地址
 */
export const getVideoUrlService = (id) =>{
    return request.get("/bangumi/video?id=" + id)
}