const isCloudinary = (url) => typeof url === "string" && url.includes("/upload/");

export const optimize = (url, width = 600) =>
    isCloudinary(url)
        ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`)
        : url;

export const optimizeVideo = (url) =>
    isCloudinary(url) ? url.replace("/upload/", "/upload/f_auto,q_auto/") : url;

// still frame of a video, used as a poster / thumbnail
export const videoPoster = (url, width = 800) =>
    isCloudinary(url)
        ? url
            .replace("/upload/", `/upload/so_0,f_jpg,q_auto,w_${width}/`)
            .replace(/\.[^/.]+$/, ".jpg")
        : undefined;