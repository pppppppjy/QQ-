//对数组类进行拓展
import myArray from "./ArrayEx.js";

//事件的类
export default class Event{

  //构造方法
  constructor(){

    //用来保存事件监听的类型和方法
    Object.defineProperty(this,"events",{
      value : {},
      enumerable : false
    });
  }

  //事件队列的触发器
  static createEvnetHandle(eType,that){

    //生成触发器的包装函数
    Reflect.set(that, eType,function(...arg){

      //将页面的 this 实例保存起来
      const page = this,
            data = [];

      //判断事件类似是不是onLoad
      if(eType === 'onLoad'){

        const argData = arg[0];
        Object.keys(argData).forEach(key=>{
          
          //onLoad 事件需要进行解码
          argData[key] = decodeURIComponent(argData[key]);
        });
      } 

      //拷贝一份事件队列方法
      const eTypeFn = Array.from(Reflect.get(that.events, eType));
      
      //递归执行动画队列
      (function recur(){

        //每次出列第一个
        const f = eTypeFn.shift();
        
        //如果是一个方法则,立马执行
        f && data.pushNameSpace(f.apply(page, arg));

        //判断队列是否为空,不为空,就开始递归
        eTypeFn.length && recur();
      }());

      return data;
    });
  }

  //获取事件队列
  getEvent(eType){

    let eTypeFn = Reflect.get(this.events, eType);

    //判断是否为空
    if (!Array.isArray(eTypeFn)){
      
      eTypeFn = [];
      Reflect.set(this.events, eType, eTypeFn);
      //this.events[eType] = eTypeFn;

      //添加一个触发器
      Event.createEvnetHandle(eType,this);
    }
    
    return eTypeFn;
  }

  // 添加一个事件监听
  addEvent(eType,callback){

    const eTypeFn = this.getEvent(eType);

    //添加到事件队列里
    eTypeFn.push(callback);
  }

  //删除一个事件监听
  removeEvent(eType, callback){

    // 带 callback 是指定删除某个
    if (callback){

      //获取事件队列
      const eTypeFn = this.getEvent(eType),
        index = eTypeFn.findIndex(item => item === callback);
      
      //删除行为是同步
      index != -1 && eTypeFn.splice(index,1);

      // 删除方法一: 将同步代码变成异步
      //index != -1 && setTimeout([].splice.bind(eTypeFn),0,index,1);
    }else{

      Reflect.set(this.events, eType,[]);
    }
  }

  // 一次性事件
  oneEvent(eType, callback){

    const that = this;
    const handle = function(...arg){

      callback.apply(this, arg);
      that.removeEvent(eType, handle);
    };

    this.addEvent(eType, handle);
  }
}