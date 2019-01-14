import Event from "./Event.js";

// 获取全局的app对象
const app = getApp();

// 方法的共用  方法的导出
export default class PageModule extends Event{

  //数据嗮选方法
  static select(obj){

    const events = {},
          data = {};

    Object.keys(obj).forEach(key=>{

      if (/function/i.test(typeof obj[key])){

        events[key] = obj[key];
      }else{

        data[key] = obj[key];
      }
    });

    return { events, data};
  }

  constructor(data){

    super();

    // 保存当前pageModule
    const pageExample = this;

    //监听一个app 的加载事件
    this.addEvent("onShow", function () {

      Reflect.set(app, "page", {
        example: pageExample,
        page: this,
        route: this.route
      });
    });

    //判断是否传入data
    data && this.extend(data);
  }

  //导出实例
  exports(...arg){

    //需要导出的事件
    arg = arg.length ? arg : Object.keys(this.events);

    const events = {};
    arg.forEach(eType=>{

      //判断事件是否存在
      if (/function/i.test(typeof this[eType])){

        events[eType] = this[eType];
      }else{

        throw new Error(`不存在 ${eType} 事件`);
      }
    });
    
    return events;
  }

  //导入
  extend(obj){

    //嗮选事件和属性
    const {events ,data} =  PageModule.select(obj);

    //添加事件
    for (let eType in events){

      this.addEvent(eType, obj[eType]);
    }

    //添加属性
    Object.assign(this, data);
  }

  //初识方法
  start(data) {
    
    //判断是否传入data
    data && this.extend(data);

    Page(this);   
  }
}