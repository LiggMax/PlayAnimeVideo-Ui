import request from "@/utils/request.js";

export const searchService = (keyword) =>{
    return request.get("/anime/Search?keyword="+ keyword)
}