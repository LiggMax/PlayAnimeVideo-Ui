import request from "@/utils/request.js";

/**
 * 搜索
 */
export const searchService = (keyword) =>{
    return request.get("/anime/search?keyword="+ keyword)
}

/**
 * 视频详情
 */
export const getAnimeDateService = (url) =>{
    return request.get("/anime/videoDate?url=" + url)
}

/**
 * 获取视频播放地址
 */
export const getVideoUrlService = (url) =>{
    return request.get("/anime/videoUrl?url=" + url)
}
