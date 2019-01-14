import PageModule from "../../lib/Page.js";
import $pagemusic from "../../model/PageMusic.js";
import LikeSong from "../../model/LikeSong.js";
import utlis from "../../utlis/utlis.js";

//本地收藏的数据库
const $like_db = new LikeSong();

//默认收藏图
const default_album = "/images/default_album.jpg";

const $page = new PageModule({

  onLoad(){

    //更新到页面
    utlis.getUserInfo()
          .then(userInfo=>{

            this.setData({
              userInfo
            })
          })

    //数据列表
    const list = $like_db.order("time","desc").all();

    //封面
    const cover = list[0] ? list[0].album_big : default_album;

    //显示列表以及封面
    this.setData({ list, cover });
  },

  //回到页面更新数据
  onShow() {

    //数据列表
    const list = $like_db.order("time", "desc").all();

    //封面
    const cover = list[0] ? list[0].album_big : default_album;

    //显示列表以及封面
    this.setData({ list, cover });
  },

  coverError(){

    this.setData({
      cover: default_album
    });
  }
});

$page.extend($pagemusic);

$page.start();
