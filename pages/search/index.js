import PageModule from "../../lib/Page.js";
import $pagemusic from "../../model/PageMusic.js";
import SearchSong from "../../model/SearchSong.js";

//歌曲搜索的缓存类
const $search_song = new SearchSong();

const $page = new PageModule({

  data :{
    q : "",
    history : []
  },

  //页面显示,更新数据
  onShow(){

   this.updata();
  },

  //主页的搜索表单事件
  query(event){

    //获取查询的歌曲名称
    const q = event.detail.value.q.trim();
    
    //判断是否全是空格
    if (!q){

      return wx.showToast({
        icon: "none",
        title: "走点心,不要全都输入空格"
      });
    }

    //保存数据到本地数据库
    $search_song.add(q);

    //更新当前的数据
    this.updata();

    //跳转到列表页
    wx.navigateTo({
      url: 'list?q=' + q
    });
  },

  //删除歌曲搜索记录
  del(event){

    //获取歌曲名
    const songName = event.currentTarget.dataset.song;
    
    //删除数据到本地数据库
    $search_song.del(songName);

    //更新当前的数据
    this.updata();
  },

  //数据更新
  updata(){

    //获取所有的数据
    const data = $search_song.all();

    //添加到页面
    this.setData({ history: data ,q : ""})
  }
});


//继承公共的音乐模块
$page.extend($pagemusic);

$page.start();