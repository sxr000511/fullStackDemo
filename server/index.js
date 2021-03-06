const express = require("express");

const app = express();

app.use(express.json());

app.use(require("cors")());
// token密钥
app.set("secret", "12345667");

// uploads下静态文件托管 ，通过/uploads可以访问
app.use("/uploads", express.static(__dirname + "/uploads"));
// admin 静态文件托管
app.use("/admin", express.static(__dirname + "/admin"));
// web托管到3000根
app.use("/", express.static(__dirname + "/web"));

// 从routes/admin引入路由文件，是个函数，传入app参数执行
// 这样在admin里面有一个app可以用
require("./routes/admin")(app);
// 引用web
require("./routes/web")(app);

// 引用数据库
require("./plugins/db.js")(app);

app.listen("3000", () => {
  console.log("3000 is listening");
});
