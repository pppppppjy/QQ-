import pageModule from "../../lib/Page.js";
import Banner from "../../model/Banner.js";
import { region, sheet, request } from "../../common/const.js";
import $pagemusic from "../../model/PageMusic.js";
import utlis from "../../utlis/utlis.js";


//页面的命名空间
const $namespace = "home/index";

//实例page模型
const $page = new pageModule({

  //监听一个加载事件
  onLoad(o){

    utlis.getUserInfo()
          .then(userInfo=>{
            console.log(userInfo)
          })
    

    //加载banner图信息
    const banner = new Banner(this);
    banner.getBanner()
          .then(data=>{

            this.setData({ banner: data});
          });

    //设置国家地区
    this.setData({ region });

    //设置歌单信息
   this.getSheet()
      .findNameSpace($namespace)
      .then(this.setSheet.bind(this));
  },

  //获取歌单信息
  getSheet(){

    const sheetPromise = [];

    //循环歌单
    sheet.forEach(item=>{
      
      //歌单类型请求
      const p = new Promise((resolve) => {

        const url = request.topid + item.id;
        wx.request({
          url: url,
          success: resolve
        });
      });

      sheetPromise.push(p);
    });

    //返回Promise
    return {
      nameSpace : $namespace,
      data: Promise.all(sheetPromise)
    };
  },

  // 设置歌单信息
  setSheet(arg){

    const sheetData = [];

    arg.forEach((res,key)=>{
      
      sheetData.push(Object.assign({
        songs: res.data.songs
      }, sheet[key]));
    });

    this.setData({ sheets : sheetData})
  }
});

//继承公共的音乐模块
$page.extend($pagemusic);

//调用page
$page.start();