import PageModule from "../../lib/Page.js";
import Storage from "../../lib/Storage.js";
import utlis from "../../utlis/utlis.js";

const $app = getApp().example;
const $user_db = new Storage("user_db");

const $page = new PageModule({

  onLoad(){

  
  },

  getUserInfo(event){

    let userInfo = event.detail.userInfo;
    
    //保存到全局的用户信息
    $app.data({ userInfo});

    //顺便更新到本地
    if ($user_db.where("time","!=","").find()){

      $user_db.where("time", "!=", "").updata(userInfo);
    }else{

      $user_db.add(Object.assign({
        time : new Date().getTime()
      }, userInfo));
    }
    $user_db.save();
    
    //跳转到首页
    wx.redirectTo({
      url: '/pages/home/index',
    });
  }
});

$page.start();