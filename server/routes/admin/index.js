// admin 路由  -》》子路由
// 导出函数app，{}是传入的参数
module.exports = (app) => {
  const express = require("express");
  const jwt = require("jsonwebtoken");
  const assert = require("http-assert");
  const AdminUser = require("../../models/AdminUser");

  // 子路由
  const router = express.Router({
    // 在调用category时可以获取到resource参数
    mergeParams: true,
  });

  // 接收到post请求引用数据库
  // "http://localhost:3000/admin/api"+"categories"
  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });
  // 修改
  router.put("/:id", async (req, res) => {
    // 两个参数
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    // console.log(model);
    res.send(model);
  });
  // 删除
  router.delete("/:id", async (req, res) => {
    // 两个参数
    const model = await req.Model.findByIdAndDelete(req.params.id);
    res.send({
      success: true,
    });
  });

  // 接收到get 搜索数据返回
  router.get("/", async (req, res) => {
    // const items = await req.Model.find().populate("parent").limit(10);
    // 扩展性-》只有category model 需要 parent查询
    const queryOptions = {};
    if (req.Model.modelName === "Category") {
      queryOptions.populate = "parent";
    }
    const items = await req.Model.find().setOptions(queryOptions).limit(100);

    res.send(items);
  });

  // 搜索详情页数据
  router.get("/:id", async (req, res) => {
    const item = await req.Model.findById(req.params.id);
    res.send(item);
  });

  // "http://localhost:3000/admin/api/rest/~~~"
  // app.use(
  //   "/admin/api/rest/:resource",
  //   async (req, res, next) => {
  //     // 调用mongoose模型【对应的】
  //     // 调用inflection包做大小写转换 小写负数resource -》大写单数model name
  //     const modelName = require("inflection").classify(req.params.resource);
  //     // 表示给请求对象挂载model，如果const后面获取不到
  //     req.Model = require(`../../models/${modelName}`);
  //     next();
  //   },
  //   router
  // );

  // ///////////////////////////
  // 登录
  // 登录校验中间件
  //  resource匹配路径
  const authMiddleware = require("../../middleware/auth");
  const resourceMiddleware = require("../../middleware/resource");
  app.use(
    "/admin/api/rest/:resource",
    authMiddleware(),
    resourceMiddleware(),
    router
  );

  const multer = require("multer");

  const upload = multer({ dest: __dirname + "/../../uploads" });
  // 中间件upload 允许接受字段名file得单个文件

  // app.post("/admin/api/upload", upload.single("file"), async (req, res) => {
  //   // 借助multer req才有file，
  //   const file = req.file;
  //   file.url = `http://localhost:3000/uploads/${file.filename}`;
  //   res.send(file);
  // });

  // upload需要中间件验证
  app.post(
    "/admin/api/upload",
    authMiddleware(),
    upload.single("file"),
    async (req, res) => {
      const file = req.file;
      file.url = `http://localhost:3000/uploads/${file.filename}`;
      res.send(file);
    }
  );

  // {}解构赋值
  // 调用assert包 抛出错误
  app.post("/admin/api/login", async (req, res) => {
    const { username, password } = req.body;
    // 1.根据用户名找用户
    const user = await AdminUser.findOne({ username }).select("+password");
    assert(user, 422, "用户不存在");
    // 2.校验密码
    const isValid = require("bcryptjs").compareSync(password, user.password);
    assert(isValid, 422, "密码错误");
    // 3.返回token
    const token = jwt.sign({ id: user._id }, app.get("secret"));
    res.send({ token });
  });

  // 错误处理函数 ，接收抛出的错误，返回message给前端用
  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message,
    });
    console.log(err.message);
  });
};
