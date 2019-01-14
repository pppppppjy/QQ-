import PageModule from "../lib/Page.js";
import { request } from "../common/const.js";

const $page = new PageModule({

  //加载事件,用来初识化数据
  onLoad(){

    Object.assign(this.data, {
      url: "",//请求的url
      page: 1,//查询第几页
      row: 20,//每页加载多少条数据
      songs: [],//数据容器数组
      stock : false // 初识库存为false  ,false代表有数据可以搜搜
    });
  },

  //加载数据
  loadPage() {

    //判断数据是否加载完毕
    if (this.data.stock) {

      return wx.showToast({
        icon: "none",
        title: '没有更多了',
      });
    }

    //打包url参数
    const url = this.data.url + "/p/" + this.data.page + "/r/" + this.data.row;

    //显示加载图标
    wx.showLoading();

    //发送请求开始加载数据   
    const res_data = new Promise((resolve, reject) => {

      wx.request({
        url: url,
        success: resolve
      });
    });

    //数据加载完毕,开始处理数据
    res_data.then(this.codePage.bind(this))
  },

  //处理数据
  codePage(res) {

    //请求拿到的数据
    const data = res.data;

    //隐藏加载图标
    wx.hideLoading();

    //更新歌单
    this.data.songs.push(...data.songs)

    //判断页数是否加载完毕
    this.data.stock = this.data.page >= data.count_page;

    //更新数据
    this.setData({
      songs: this.data.songs
    });
  },

  //加载更多
  morePage() {

    this.data.page++;

    this.loadPage();
  },

  //图片加载错误
  imgLoadError(event){

    //默认图片
    let imgUrl = "/images/default_album.jpg",
      song = event.target.dataset.song;

    let index = this.data.songs.findIndex(item => item.song_mid === song.song_mid);

    if (index > -1){
      this.data.songs[index].album_min = imgUrl
      this.data.songs[index].album_big = imgUrl;
      this.setData({ songs: this.data.songs});
    }
  }
});

export default $page;