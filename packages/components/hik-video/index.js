import FleHikVideo from "./src/hik-video.vue";

FleHikVideo.install = function (vue) {
  vue.components(FleHikVideo.name, FleHikVideo);
};

export default FleHikVideo;
