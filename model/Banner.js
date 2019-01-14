// 播放页面两个箭头 主页轮播
/* 获取广告图信息 */
import AudioManager from "../lib/AudioManager.js";

export default class Banner{
  
  constructor(page){

    //监听一个广告图的动作信息
    Reflect.set(page, "actionBanner", Banner.actionBanner);
  }

  //跳转方法
  static actionBanner(event){

    const action = event.currentTarget.dataset.action;

    //是否为专题跳转
    if (action.atype === 0){

      wx.navigateTo({
        url: '/pages/sheet/list?id=' + action.data.id + "&name=" + action.data.name
      });
    }

    //是否专辑推荐
    if (action.atype === 1){

      AudioManager.setSong(action.data,[]);
      wx.navigateTo({
        url: `/pages/player/index?name=${action.data.song_name}&mid=${action.data.song_mid}`
      });
    }
  }

  //获取banner图信息
  getBanner(){

    const data = [];

    //banner图的类型有多种,有的是跳转专题,有的单曲推荐
    data.push({
      img: "//y.gtimg.cn/music/common/upload/MUSIC_FOCUS/595982.jpg?max_age=2592000",
      atype : 0,//专题
      data : {
        id : 108,
        name: "美国公告牌榜"
      }
    });

    //单曲推荐
    data.push({
      img: "http://p1.music.126.net/eutlOcSlh-dtpWq328R6bQ==/109951163615791721.jpg",
      atype: 1,//单曲推荐

      data: {
        song_url: "http://ws.stream.qqmusic.qq.com/C100001dPKD40OUxFz.m4a?fromtag=0&guid=0",
        song_mid: "001dPKD40OUxFz",
        song_name: "耳朵",
        song_orig: "李荣浩",
        album_min: "https://y.gtimg.cn/music/photo_new/T002R90x90M000004QnEHc3zjC7J.jpg",
        album_big: "https://y.gtimg.cn/music/photo_new/T002R300x300M000004QnEHc3zjC7J.jpg",
        album_mid: "004QnEHc3zjC7J",
        album_name: "耳朵"
      }
    });
    


    // 真正banner图信息是从后台获取的,所以这里有回调,使用promise返回
    return new Promise((resolve)=>{
      
      resolve(data);
    });
  }
} 