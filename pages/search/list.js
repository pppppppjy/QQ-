import PageModule from "../../lib/Page.js";
import { request } from "../../common/const.js";
import $pageList from "../../model/PageList.js";
import $pagemusic from "../../model/PageMusic.js";
import SearchSong from "../../model/SearchSong.js";

//歌曲搜索的缓存类
const $search_song = new SearchSong();

const $page = new PageModule($pageList);

//继承公共的音乐模块
$page.extend($pagemusic);

//页面加载
$page.start({

  //打包请求url
  onLoad (query){

    //需要搜索歌名
    const songName = query.q;
    
    //打包请求url  http://api.atoz.ink/query/小小恋歌/26/p/2
    this.data.url = request.query + songName;

    //显示导航标题
    wx.setNavigationBarTitle({
      title: songName
    });

    //显示搜索歌名
    this.setData({ q: songName})

    // //开始去请求数据
    this.loadPage();
  },

  //搜索表单
  query(event){

    //搜索表单数据
    const data = event.detail.value;
    
    //添加到搜索缓存
    $search_song.add(data.q);

    //重新调用onLoad事件
    this.onLoad(data);
  }
});