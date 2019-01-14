//.lib是一种文件名后缀，代表的是静态数据连接库，在windows操作系统中起到链接程序和函数(或子过程)的作用
import Event from "./Event.js";

//因为app方法还没有被执行,所以getApp会是一个undefined
let app;

// 公共数据的发送 和 保存
export default class AppModule extends Event{

  //全局数据
  globalData = {};

  //页面数据
  pageData = {};

  constructor() {

    super();
  }

  //给当前页面设置数据的, 不用在实际显示的页面设置数据, 通过assign代理直接给当前页设置
  static assign(key,val){
    
    //等待 app 以及 page 的onLoad事件执行
    if (!app || !app.page){
     
      return setTimeout(AppModule.assign.bind(null, key, val), 0);
    }

    //拿到当前显示的页面实例
    let page = app.page.page,
        kType = typeof key;
    
    if (/string/i.test(kType) && val !== undefined){

      page.setData({
        [key] : val
      });
    } else if (/object/i.test(kType)){

      page.setData(key);
    }
  }

  // 用于修改全局数据的
  data(...arg){

    //没有参数直接返回
    if (arg.length === 0){

      return this.globalData;
    } else if (arg.length === 1){
      
      //获取第一个参数类型
      const kType = typeof arg[0];
      
      //判断类型是否为字符串
      if (/string/i.test(kType)){
        
        //获取某一项
        return this.globalData[arg[0]];
      }

      //如果是对象
      if (/object/i.test(kType)){
        
        const data = arg[0];
        for (let key in data){

          this.data(key,data[key]);
        }
      }
    } else if (arg.length === 2){

      this.globalData[arg[0]] = arg[1];
    }
  }

  //初识化方法
  start(){

    const appExample = this;

    //监听一个app 的加载事件
    this.oneEvent("onLaunch",function(){
     
      Reflect.set(this, "example", appExample);

      //拿到app实例
      app = this;
    })

    //App方法调用的时候接受一个对象,会通过浅拷贝的方式将数据添加到app方法里
    App(this);
  }
}