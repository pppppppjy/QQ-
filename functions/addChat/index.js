// 云函数入口文件
const cloud = require('wx-server-sdk');

//云端的也需要指定环境
cloud.init({
  env: "release-a8aeaf"
});


const db = cloud.database();//获取到服务端的数据库
const song_chat = db.collection("song_chat");//拿到表(集合)

// 云函数入口函数
exports.main = async (event, context) => {

  //event 自带userInfo 保存的就是用户的openid ,传递数据的时候不要用userInfo
  
  const data = {
    song_mid: event.song_mid,//评论歌曲的id
    chat: event.chat,//评论内容
    userInfo : {
      openId: event.userInfo.openId,//用户关联开发者账号的openid
      avatarUrl: event.user.avatarUrl,// 用户头像封面
      gender: event.user.gender,//性别
      nickName: event.user.nickName//昵称
    },
    time : new Date().getTime()//评论的时间
  };

  //数据库的操作可能会引发错误,需要  try catch打印异常
  try {

    //return await song_chat;
    return await song_chat.add({
      // data 字段表示需新增的 JSON 数据
      data : data
    });
  } catch (e) {
    console.error(e)
  }
}