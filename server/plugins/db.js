module.exports = (app) => {
  const mongoose = require("mongoose");
  mongoose.connect("mongodb://127.0.0.1:27017/fullstackdemo", {
    useNewUrlParser: true,
    // 还没用到app
  });

  // 把文件引用进来全使用一遍
  require("require-all")(__dirname + "/../models");
};
