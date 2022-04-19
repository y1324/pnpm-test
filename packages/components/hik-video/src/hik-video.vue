<template>
  <!-- 视频播放 -->
  <el-card shadow="never" v-show="value" class="video-card">
    <div class="fle-hik-video-main" v-loading="loading">
      <!-- 摄像头 canvas -->
      <div id="player" v-if="value"></div>

      <!--  操作 -->
      <div class="btn-container">
        <!-- 分屏 -->
        <div class="split-number">
          <el-radio-group v-model="splitNumber" @change="arrangeWindow">
            <el-radio-button :label="1">1x1</el-radio-button>
            <el-radio-button :label="2">2x2</el-radio-button>
            <el-radio-button :label="3">3x3</el-radio-button>
            <el-radio-button :label="4">4x4</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 时间轴 -->
        <el-slider
          v-if="!loading && cameraList[playerIndex]"
          :disabled="
            cameraList[playerIndex] && cameraList[playerIndex].playStatus
          "
          v-model="timeSlider"
          :step="0.0001"
          :max="maxTime"
          :format-tooltip="formatTooltip"
          @change="timeChange"
        />

        <!-- 播放/暂停  -->
        <el-button v-if="!loading" type="primary" @click="relay">{{
          cameraList[playerIndex] && cameraList[playerIndex].playStatus
            ? "播放"
            : "暂停"
        }}</el-button>

        <!-- 时间 -->
        <el-date-picker
          v-if="!loading && cameraList[playerIndex]"
          class="location-btn"
          v-model="videoTime"
          type="datetime"
          value-format="yyyy-MM-ddTHH:mm:ss"
          placeholder="时间"
          :picker-options="pickerOptions"
        />
        <!-- 定位 -->
        <el-button
          v-if="!loading"
          :disabled="
            cameraList[playerIndex] && cameraList[playerIndex].playStatus
          "
          class="location-btn"
          @click="seekTo('seekTo')"
          >定位</el-button
        >
      </div>
    </div>
  </el-card>
</template>

<script>
/**
 * 海康视频组件
 * @param {object} queryData ｜ 视频信息
 * @param {boolean} v-model ｜ 是否显示
 * @param {string} basePath ｜ 播放器路径
 * @param {array} cameraData ｜ 视频信息列表
 * @property {string} cameraData.beginTime          - 视频开始时间
 * @property {string} cameraData.camera_index_code  - 摄像头key
 * @property {string} cameraData.camera_name        - 摄像头名称
 * @property {string} cameraData.endTime            - 视频结束时间
 * @property {string} cameraData.url                - 视频url
 * @property {number} cameraData.timeSlider         - 定位毫秒
 * @property {string} cameraData.seekTime           - 定位时间
 * @property {boolean} cameraData.playStatus         - 播放状态。true：暂停，false: 播放
 *
 * */
import dayjs from "dayjs";
// 开发时调整导入的路径(../assets)，发布时改成(./assets)，basePath同理
const h5play = require("./assets/js/h5player.min");

export default {
  name: "FleHikVideo",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    queryData: {
      type: Object,
      default: () => {},
    },
    cameraData: {
      type: Array,
      default: () => [
        {
          beginTime: "2022-03-20T23:59:50",
          camera_index_code: "e1fa46f27b704188ad64356124550209",
          camera_name: "380_Camera03",
          endTime: "2022-03-23T10:34:39",
          url: "ws://cctv-th-9.flashexpress.pub:559/openUrl/XelzXsk?beginTime=20220320T235950&endTime=20220323T103309",
          timeSlider: 0, // 定位毫秒
          seekTime: "2022-03-20T23:59:50", // 定位时间
          playStatus: true, // true：暂停状态，false: 播放状态
        },
        {
          beginTime: "2022-03-20T23:59:50",
          camera_index_code: "d1d9554e4d5843a9b101a56ac999b47f",
          camera_name: "381_Camera14",
          endTime: "2022-03-23T10:34:39",
          url: "ws://cctv-th-9.flashexpress.pub:559/openUrl/XiSjf68?beginTime=20220320T235950&endTime=20220323T103330",
          timeSlider: 0, // 定位毫秒
          seekTime: "2022-03-20T23:59:50", // 定位时间
          playStatus: true, // true：暂停状态，false: 播放状态
        },
      ],
    },
    basePath: {
      type: String,
      default: "./assets/js/",
    },
  },
  computed: {
    mode() {
      return 1;
    },
    maxTime() {
      // 计算结束时间到开始时间差秒单位，除以10000
      return (
        (new Date(this.cameraList[this.playerIndex].endTime).getTime() / 1000 -
          new Date(this.cameraList[this.playerIndex].beginTime).getTime() /
            1000) /
        10000
      );
    },
  },
  watch: {
    async value(v) {
      if (v) {
        window.JSPlugin = h5play.JSPlugin;
        this.cameraList = this.cameraData || [];
        await this.init();
      } else {
        this.handleClose();
      }
    },
  },
  data() {
    return {
      visible: false, // 弹框是否显示
      playLoading: false, // 播放按钮加载
      playerIndex: 0, // 视频第几个
      cameraList: [], // 所有的摄像头
      loading: false, // 加载视频状态
      videoTime: "", // 视频时间
      pickerOptions: {
        disabledDate: (time) => {
          return this.dealDisabledDate(time);
        },
      },
      timeSlider: 0, // 时间轴
      splitNumber: 2, // 分屏基数
    };
  },
  methods: {
    async init() {
      this.$nextTick(() => {
        this.createPlayer();
        this.playStartAll();
      });
    },

    // 初始化视频插件
    createPlayer() {
      let that = this;
      this.player = new window.JSPlugin({
        szId: "player", // dom ID名
        szBasePath: this.basePath,
        iMaxSplit: 4, // 最多 n * n 屏
        iCurrentSplit: this.splitNumber, // 当前 n * n 屏
        openDebug: false, // 是否开启debug
        oStyle: {
          borderSelect: "#FFCC00", // 当前被选中边框
        },
      });
      // 事件回调绑定
      this.player.JS_SetWindowControlCallback({
        windowEventSelect: function (iWndIndex) {
          //插件选中窗口回调
          that.playerIndex = iWndIndex;
          if (iWndIndex <= that.cameraList.length - 1) {
            that.videoTime = that.cameraList[iWndIndex].seekTime;
            that.timeSlider = that.cameraList[iWndIndex].timeSlider;
          }
        },
      });
    },

    // 播放
    playStart(
      item,
      index = 0,
      type = "",
      resolve = () => {},
      reject = () => {}
    ) {
      if ((item === undefined || item.url === "") && type === "click") {
        this.$notify({
          title: "Info",
          message: "当前无视频流", // 当前无视频流
          type: "warning",
        });
      }

      if (item.url !== "") {
        this.playLoading = true;
        let { player, mode } = this,
          playURL = item.url,
          { beginTime, endTime } = item;
        beginTime += "Z";
        endTime += "Z";
        player
          .JS_Play(playURL, { playURL, mode }, index, beginTime, endTime)
          .then(
            () => {
              this.playLoading = false;
              resolve(index);
            },
            (e) => {
              this.playLoading = false;
              console.error(e);
              reject(e);
            }
          );
      }
    },
    // 默认选中4个并播放获取首帧
    playStartAll() {
      if (this.cameraList.length > 0) {
        this.loading = true;
        const playArray = [];
        this.cameraList.forEach((item, index) => {
          playArray.push(
            new Promise((resolve, reject) => {
              this.playStart(item, index, "frame", resolve, reject);
            })
          );
        });

        const allPlay = Promise.allSettled(playArray);
        allPlay.then(() => {
          this.playbackPauseAll();
        });

        setTimeout(() => {
          this.loading = false;
        }, 8000);
      }
    },

    // 暂停或播放
    relay() {
      if (this.cameraList[this.playerIndex].playStatus) {
        // 播放
        this.playbackResume(this.playerIndex);
      } else {
        // 暂停
        this.playbackPause(this.playerIndex);
      }
    },

    // 暂停
    playbackPause(index) {
      this.player.JS_Pause(index).then(
        () => {
          this.cameraList[this.playerIndex].playStatus = true;
        },
        (err) => {
          console.log(err);
        }
      );
    },
    // 暂停所有,
    playbackPauseAll() {
      if (this.cameraList.length > 0) {
        this.cameraList.forEach((item, index) => {
          this.playbackPause(index);
        });
      }
    },
    // 恢复
    playbackResume(index) {
      this.player.JS_Resume(index).then(
        () => {
          this.cameraList[this.playerIndex].playStatus = false;
        },
        (err) => {
          console.log(err);
        }
      );
    },
    // 停止
    stopPlay(index) {
      this.player.JS_Stop(index);
    },
    // 停止所有
    stopPlayAll() {
      this.player.JS_StopRealPlayAll();
    },
    // 关闭视频播放
    handleClose() {
      this.stopPlayAll();
      this.player = null;
      this.cameraList = [];
      this.videoTime = "";
      this.timeSlider = 0;
      this.playerIndex = 0;
      this.$emit("input", false);
    },
    // 视频定位
    seekTo(type) {
      let seekStart = this.videoTime;
      let endTime = this.cameraList[this.playerIndex].endTime;

      const slider =
        (new Date(this.videoTime).getTime() / 1000 -
          new Date(this.cameraList[this.playerIndex].seekTime).getTime() /
            1000) /
        10000;

      // type用于区分定位按钮还是拉动时间轴，产生时间差来同步时间轴
      if (type === "seekTo" && slider > 0) {
        this.timeSlider = slider;
      }
      if (slider > 0) {
        this.cameraList[this.playerIndex].timeSlider = slider;
      }

      this.cameraList[this.playerIndex].seekTime = this.videoTime;

      seekStart += "Z";
      endTime += "Z";

      this.player
        .JS_Seek(this.player.currentWindowIndex, seekStart, endTime)
        .then(
          () => {
            console.log("seekTo success");
            this.$notify({
              title: "",
              message: "定位成功，视频加载中！", // 定位成功，视频加载中！
              type: "success",
            });
          },
          (e) => {
            console.error(e);
            this.$notify({
              title: "",
              message: "定位失败，请重试", // 定位失败，请重试
              type: "warning",
            });
          }
        );
    },
    // 设置日期范围
    dealDisabledDate(time) {
      if (this.cameraList[this.playerIndex]) {
        const { beginTime, endTime } = this.cameraList[this.playerIndex];

        // 限制开始时间和结束时间3天内
        return (
          time.getTime() <= new Date(beginTime).getTime() - 86400000 ||
          time.getTime() >= new Date(endTime).getTime() - 86400000
        );
      }
    },
    // 显示时间tip
    formatTooltip(val) {
      /**
       * 1天等于 86400 秒，3天等于259200 秒
       * @link 实现思路文档：https://l8bx01gcjr.feishu.cn/docs/doccnDbIGz3KgDZuKo2NDGEX6rb
       * */

      // 将定位时间生成时间戳
      const stamp =
        new Date(this.cameraList[this.playerIndex].beginTime).getTime() / 1000;

      // 计算滚动时间戳
      const startTime = new Date(stamp + val * 10000);

      this.videoTime = dayjs(new Date(startTime * 1000)).format(
        "YYYY-MM-DDTHH:mm:ss"
      );

      this.cameraList[this.playerIndex].seekTime = dayjs(
        new Date(startTime * 1000)
      ).format("YYYY-MM-DDTHH:mm:ss");
      this.cameraList[this.playerIndex].timeSlider = val;

      return dayjs(new Date(startTime * 1000)).format("YYYY/MM/DD HH:mm:ss");
    },
    // 滑动时间change
    timeChange() {
      this.seekTo();
    },
    // 分屏
    arrangeWindow() {
      let splitNum = this.splitNumber;
      this.player.JS_ArrangeWindow(splitNum).then(
        () => {
          console.log(`arrangeWindow to ${splitNum}x${splitNum} success`);
        },
        (e) => {
          console.error(e);
        }
      );
    },
  },
};
</script>

<style scoped lang="less">
.fle-hik-video-main {
  width: 100%;
}

#player {
  width: 100%;
  height: calc(78vw * 5 / 8);
}

.btn-container {
  text-align: center;
  margin-top: 15px;
  padding-bottom: 10px;

  .split-number {
    margin-bottom: 8px;
  }
}
.location-btn {
  margin-left: 12px;
}
</style>
