
import Storage from "../lib/Storage.js";

//数据库名字
const dbname = "like_song";

export default class LikeSong extends Storage {

  constructor(){

    super(dbname);
  }

  //验证是够已经收藏了歌曲
  has(mid){

    return this.where("song_mid", mid).find() ? true : false;
  }

  //添加收藏
  add(song){

    //需要保存的数据
    const dataKey = ["song_url", "song_mid", "song_name", "song_orig", "album_min", "album_big", "album_mid","album_name"],
          data = {};
    
    //遍历设置
    dataKey.forEach(key => data[key] = song[key]);

    super.add(Object.assign({
      time : new Date().getTime(),
    }, data)).save();
  }

  //删除收藏
  del(song){

    //查找到数据
    this.where("song_mid", song.song_mid);
    super.del().save();
  }
}