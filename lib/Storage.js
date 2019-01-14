//.lib是一种文件名后缀，代表的是静态数据连接库，在windows操作系统中起到链接程序和函数(或子过程)的作用
//类的私有方法
const whereCompare = {

  //判断相等的情况下
  "=" : function(that,value){
    
    return that == value;
  },

  //判断不相等的情况下
  "!=": function (that, value) {

    return that != value;
  },

  //大于
  ">": function (that, value) {

    return that > value;
  },

  //大等于
  ">=": function (that, value) {

    return that >= value;
  },

  //小于
  "<": function (that, value) {

    return that < value;
  },

  //小等于
  "<=": function (that, value) {

    return that <= value;
  },

  //模糊查询
  "like": function (that, value){
    
    return new RegExp(value, "i").test(that)
  }
};


//离线的类
export default class Storage{

  //构造函数
  constructor(dbname){

    Object.assign(this, {
      dbname,//数据库名
      //类的缓存,存档和读档
      cache : {
        add : {
          data : []
        }
      }
    });
  }

  //实时获取类中数据库的数据
  static getDb(dbname){

    return wx.getStorageSync(dbname) || [];
  }

  // 获取where函数
  static getWhere(action) {

    if(this.whereFn){

      const whereFn = this.whereFn;
      this.whereFn = null;
      return whereFn;
    }else{

      throw new Error(`调用 ${action} 方法时,请先调用 where 方法查询`);
    }
  }

  //构建查询语句
  where(...args){

    let [key, compare, value] = args;

    //判断是否是个对象
    if (/object/i.test(typeof key)){
      
      for(let k in key){
        
        if (Array.isArray(key[k])){
          
          this.where(k, ...key[k]);
        }else{

          this.where(k,key[k]);
        }
      }
      return this;
    }

    if (value === undefined){
     
      value = compare;
      compare = "=";
    }
    
    //获取对比函数
    const compareFn = whereCompare[compare];

    //用户传递进来是否为当前类支持的对比方式
    if (compareFn){
      
      //第一次进来构建where 查询函数
      if (!this.whereFn){

        //构建一个where方法
        const whereFn = (item)=>{

          // 用来计数,统计成功的条件
          let compareNum = 0;

          //统计所有条件
          whereFn.compare.forEach(compare=>{
            
            compareNum += ~~compare.compareFn(item[compare.key], compare.value);
          });

          return compareNum === whereFn.compare.length;
        };
        
        //定义数组来存对比方式
        whereFn.compare = [];

        //赋值到this
        this.whereFn = whereFn;
      }

      //记录当前的对比条件
      this.whereFn.compare.push({
        key, value, compareFn
      });
    }else{

      throw new Error("where 不支持 " + compare+" 的对比方式");
    }

    return this;
  }

  //添加数据
  add(data){

    //如果是一个数组,则循环递归自己添加数据
    if (Array.isArray(data)){

      data.forEach(item=>{

        this.add(item)
      });
    } else if (/object/.test(typeof data)) {//如果是一个对象,则直接push到add缓存
      
      //添加到新增缓存
      this.cache.add.data.push(data);
    }else{

      throw new Error("add 方法接受对象为参数");
    }

    return this;
  }

  //删除方法
  del(){

    this.cache.del = {
      where : Storage.getWhere.call(this,"del")
    };

    return this;
  }

  //修改数据
  updata(data){
    
    if (/object/i.test(typeof data)){
        
        //记录到实例缓存里面
        this.cache.updata = {
          data,
          where: Storage.getWhere.call(this,"updata")
        }
    }else{

      throw new Error("updata 仅接受对象参数");
    }

    return this;
  }

  //查找一条数据
  find() {

    // 先去本地拿数据,接着缓存合并保存
    const db = Storage.getDb(this.dbname);

    //如果需要排序
    this.sortFn && db.sort(this.sortFn);

    return db.find(Storage.getWhere.call(this, "find"));
  }

  // 查询多个
  select(){

    // 先去本地拿数据,接着缓存合并保存
    const db = Storage.getDb(this.dbname), 
          data = db.filter(Storage.getWhere.call(this, "select"));

    //如果需要排序
    this.sortFn && data.sort(this.sortFn);

    return this.sliceArg ? data.slice(...this.sliceArg) : data;
  }

  //查询所有数据
  all(){

    //直接拿到数据库所有数据
    const data = Storage.getDb(this.dbname);

    //如果需要排序
    this.sortFn && data.sort(this.sortFn);

    return this.sliceArg ? data.slice(...this.sliceArg) : data;
  }

  // 排序
  order(key,sort="asc"){

    this.sortFn = (a,b)=>{

      return /desc/i.test(sort)
              ? b[key] - a[key]
              : a[key] - b[key];
    }

    return this;
  }

  // 数据截取
  limit(start,end){

    if(end === undefined){

      end = start;
      start = 0;
    }else{
      
      --start;
      end += start;
    }

    this.sliceArg = [start, end];

    return this;
  }
  
  //将缓存更新到本地数据
  save(){

    // 先去本地拿数据,接着缓存合并保存
    let db = Storage.getDb(this.dbname);

    // 删除数据
    if (this.cache.del){

      db = db.filter((item)=>{

        return !this.cache.del.where(item);
      });
    }

    // 更新数据
    if (this.cache.updata){

      db.forEach((item)=>{

        if (this.cache.updata.where(item)){

          Object.assign(item, this.cache.updata.data)
        }
      });
    }
  
    //是否存在add数据缓存
    if(this.cache.add){

      db.push(...this.cache.add.data);
    }
    
    //更新本地缓存
    wx.setStorageSync(this.dbname, db);

    //更新类的缓存
    this.cache = {
      add : {
        data : []
      }
    }

    return this;
  }
} 