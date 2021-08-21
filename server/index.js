const express = require("express");

const app = express();

app.use(express.json());

app.use(require("cors")());

// 从routes/admin引入路由文件，是个函数，传入app参数执行
// 这样在admin里面有一个app可以用
require("./routes/admin")(app);

// 引用数据库
require("./plugins/db.js")(app);

app.listen("3000", () => {
  console.log("3000 is listening");
});
