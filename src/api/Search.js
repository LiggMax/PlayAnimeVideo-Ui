import request from "@/utils/request.js";

export const searchService = (keyword) =>{
    return request.get("https://api.bgm.tv/search/subject/{keywords}"+ keyword)
}