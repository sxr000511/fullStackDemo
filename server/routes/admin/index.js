// admin 路由  -》》子路由
// 导出函数app，{}是传入的参数
module.exports = (app) => {
  const express = require("express");
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
    const items = await req.Model.find().setOptions(queryOptions).limit(10);

    res.send(items);
  });

  // 搜索详情页数据
  router.get("/:id", async (req, res) => {
    const item = await req.Model.findById(req.params.id);
    res.send(item);
  });

  // "http://localhost:3000/admin/api/rest/~~~"
  app.use(
    "/admin/api/rest/:resource",
    async (req, res, next) => {
      // 调用mongoose模型【对应的】
      // 调用inflection包做大小写转换 小写负数resource -》大写单数model name
      const modelName = require("inflection").classify(req.params.resource);
      // 表示给请求对象挂载model，如果const后面获取不到
      req.Model = require(`../../models/${modelName}`);
      next();
    },
    router
  );
};