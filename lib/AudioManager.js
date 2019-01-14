import AppModule from "../lib/App.js";
import Storage from "../lib/Storage.js";
import LikeSong from "../model/LikeSong.js";
import utlis from "../utlis/utlis.js";
import { request } from "../common/const.js";

//音频的本地缓存
const $audio_db = new Storage("audio_db");

//收藏歌单的本地储存
const $like_db = new LikeSong();

//全局唯一的背景播放器
const audio = wx.getBackgroundAudioManager();

//管理全局唯一的背景音频播放器
export default class AudioManager{

  //使用静态变量保存,方便后续代码的引用
  static audio = audio;

  //当前播放的音乐
  static song = null;

  //当前所播放的歌单
  static songs = null;

  //设置当前播放的歌单/歌曲
  static setSong(song,songs){
   

    //播放器的属性
    const audioAttr = {
      //src: song.song_url,//歌曲的url
      title: song.song_name,//歌曲名称
      epname: song.album_name,//专辑名称
      singer: song.song_orig,//歌手名称
      coverImgUrl: song.album_min//封面
    };
    
    //添加到页面上
    AudioManager.saveSong(song, songs);

    //请求获取真实的url路径
    wx.request({
      url: request.song_url + "/" + song.song_mid,
      success:(res)=>{
        
        //设置上歌曲的临时路径
        audioAttr.src = res.data;
        //设置到 audio 播放器上,如果设置了src,会自动播放
        Object.assign(audio, audioAttr);
      }
    });   
  }

  //获取歌曲数据
  static getSong(){
    
    //歌曲/歌单
    const data = {
      song : {},
      songs : []
    };

    Object.keys(data).forEach(key=>{

      if (AudioManager[key]){

        data[key] = AudioManager[key];
      }else{
        
        //从本地获取数据
        const keyData = $audio_db.where("type", key).find();

        //用户第一次进来,是肯定没有数据的
        if (keyData){

          data[key] = keyData.data;
        }
      }
    }); 

    return {
      playerSong: data.song,
      playerSongs: data.songs
    };
  }

  // 保存当前歌曲状态
  static saveSong(song, songs){
    
    //需要保存的数据
    const data = { song, songs };

    //保存到类
    Object.assign(AudioManager, data);

    //更新到页面
    AppModule.assign({
      playerSong: song,
      playerSongs: songs
    });

    //遍历需要保存的数据
    Object.keys(data).forEach(key=>{

      //保存的类型
      const where = { "type": key };

      //保存的数据
      const upData = Object.assign({}, where, {
                        data: data[key],
                        time: new Date().getTime()
                      });

      //判断是否为修改或者新增
      if ($audio_db.where(where).find()){
        
        $audio_db.where(where).updata(upData);
      }else{

        $audio_db.add(upData);
      }

      //保存到本地
      $audio_db.save();
    });
  }

  // audio 事件行为代理触发
  static trigger(eType,that,...arg){
    
    //验证是否存在方法名 如果存在就执行
    Reflect.has(audio, eType) && Reflect.apply(audio[eType], that, arg);
  }

/*============= 通过页面代理触发的函数 this指向页面实例 =============*/ 
  
  //播放 暂停事件
  static play(){
    
     //paused => true undefined 就是停止 false 就是播放
    //有没有设置src
    if (audio.paused === undefined ){

      AudioManager.setSong(this.data.playerSong, this.data.playerSongs);
    } else if (audio.paused === true){//播放

      audio.play();
    }else{//暂停

      audio.pause();
    }
  }

  //歌曲切换上下一首
  static songTab(statu){

    //找到当前下标
    let index = this.data.playerSongs.findIndex(song => song.song_mid === this.data.playerSong.song_mid);

    //根据状态递增或者递减
    (statu) ? ++index : --index;
    
    //小于0的情况
    (index < 0) && (index = this.data.playerSongs.length - 1);

    //超过length的情况 新增 取模
    index %= this.data.playerSongs.length;

    //设置播放歌曲
    AudioManager.setSong(this.data.playerSongs[index], this.data.playerSongs);
  }

  //上一首
  static prev(){

    AudioManager.songTab.call(this,false);
  }

  //下一首
  static next(){

    AudioManager.songTab.call(this, true);
  }

  //点击收藏
  static like(){

    if ($like_db.has(this.data.playerSong.song_mid)){

      //存在则取消收藏
      $like_db.del(this.data.playerSong);
    }else{

      //不存在则收藏
      $like_db.add(this.data.playerSong);
    }
    
    //更新收藏状态
    this.setData({
      like: $like_db.has(this.data.playerSong.song_mid)
    });
  }

  //显示聊天界面
  static chat(){

    //打开子页面的形式跳转
    wx.navigateTo({
      url: '/pages/player/chat?' + utlis.objDeUCode(this.data.playerSong),
    });
  }

  //下载事件
  static download(){

    //需要下载的路径
    const url = this.data.playerSong.song_url;

    wx.showToast({
      icon : "none",
      title: `正在下载 ${this.data.playerSong.song_name}`,
    })

    const flies = wx.downloadFile({
      url,
      success(res){

        //将临时路径保存到本地缓存文件夹,只能在微信小程序中使用,外部无法使用
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success(res){

            console.log("保存到本地成功!");
            console.log(res);//wxflie//
          }
        })
      }
    });

    //监听一个下载进度事件
    flies.onProgressUpdate((flie)=>{

      console.log(`已下载 ${flie.progress}%` );
    });
  }

/*============= 通过页面代理触发的函数 this指向页面实例 =============*/

  //构造方法
  constructor(){}
}