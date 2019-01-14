import AppModule from "./lib/App.js";
import utlis from "./utlis/utlis.js";
import {envStr,envObj} from "./common/const.js";

//初始化云开发功能
wx.cloud.init({ env: envStr});


const $app = new AppModule();



$app.addEvent("onLaunch",function(){

})

$app.start();



// app -> page