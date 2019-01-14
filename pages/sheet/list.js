// pages/sheet/list.js 
import PageModule from "../../lib/Page.js";
import { request } from "../../common/const.js";
import $pageList from "../../model/PageList.js";
import $pagemusic from "../../model/PageMusic.js";


const $page = new PageModule($pageList);

//加载事件,开始请求数据
$page.addEvent("onLoad", function (sheet){



    //打包请求url  http://api.atoz.ink/topid/26/p/2
    // http://api.atoz.ink/topid/26?p=2
    this.data.url = request.topid + sheet.id;

    //显示导航标题
    wx.setNavigationBarTitle({
      title: sheet.name
    });

    //开始去请求数据
    this.loadPage();
});

//继承公共的音乐模块
$page.extend($pagemusic);

$page.start();