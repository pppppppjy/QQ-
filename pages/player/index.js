import pageModule from "../../lib/Page.js";
import $pagemusic from "../../model/PageMusic.js";
import AudioManager from "../../lib/AudioManager.js";
import LikeSong from "../../model/LikeSong.js";
import { request } from "../../common/const.js"

//全局的背景播放器
const audio = AudioManager.audio;


//收藏歌单的本地储存
const $like_db = new LikeSong();

const $page = new pageModule({
  
  //http://api.atoz.ink/lyrics/
  onLoad(o){

    //初识数据
    this.setData({
      multiple: 8,
      duration: 150,
      current: 0,
      currentIndex: 0
    });

    //设置导航标题
    wx.setNavigationBarTitle({
      title: o.name || ''
    });

    //收藏状态
    this.setData({
      like: $like_db.has(o.mid)
    });

    //获取歌词
    this.getLyrics(o.mid);
  },

  //获取歌词
  getLyrics(mid){
    
    //请求的url
    const url = request.lyrics + mid;

    //请求数据
    new Promise((resolve,reject)=>{

      wx.request({
        url,
        success: resolve,
        fail: reject
      });
    }).then(res=>{

      //歌词数组
      const lyrics = res.data.lyric;

      //如果为空
      if (lyrics.length === 0){

        lyrics.push({
          millisecond : 0,
          second : 0,
          date: "00:00.00",
          text : "暂时无歌词"
        });
      }

      //如果只有一条歌词,显示行数设置为1
      if (lyrics.length === 1){

        this.setData({ multiple :1})
      }else{
        
        this.setData({ multiple: 8 })
      }
     
      this.setData({ lyrics});
    });
  },

  //设置进度条
  setSeek(event){

    const time = event.detail.value;

    //设置进度条
    AudioManager.trigger('seek', this, time);
  },

  //进度条更新时间
  onTimeUpdate(){

    //如果获取到的歌词为空,那么直接就不滚动了
    if (!this.data.lyrics || !this.data.lyrics.length){

      return false;
    }

    let currentTime = ~~(audio.currentTime * 1000),//歌曲的毫秒数
      currentIndex = this.data.lyrics.findIndex(item => item.millisecond > currentTime);//判断当前歌词所在的下标

    //判断是不是最后一句歌词
    if (currentTime >= this.data.lyrics[this.data.lyrics.length - 1].millisecond){

      //如果时间超过最后一句歌词的毫秒数,则直接等于最后一句歌词
      currentIndex = this.data.lyrics.length - 1;
    }else{
      
      //否则下标减一
      --currentIndex;
    }
    //小于0直接等于0
    currentIndex = Math.max(0, currentIndex);

    //滚动的下标
    let current = Math.max(0, currentIndex - ~~(this.data.multiple/2));

    //判断歌词是否到了最后一页
    current = Math.min(current, this.data.lyrics.length - this.data.multiple);

    //更新数据
    this.setData({ current, currentIndex})  
  },

  //每次切换歌曲都会触发准备就绪的回调函数
  onCanplay(){

    //设置导航标题
    wx.setNavigationBarTitle({
      title: this.data.playerSong.song_name
    });

    //收藏状态
    this.setData({
      like: $like_db.has(this.data.playerSong.song_mid)
    });

    //重新获取歌词
    this.getLyrics(this.data.playerSong.song_mid);
  }
});

//继承公共的音乐模块
$page.extend($pagemusic);

//调用page
$page.start();