1. 搭建后端管理系统
2. 前端
   cli3

# vue 项目： server

server 给后台和前端的接口
服务端自定义脚本 serve，方便启动，执行 nodemon index.js

# admin 管理后台

## 1. 基于 Element UI 的后台管理基础界面搭建

main.vue 存放整体布局

## 2. 创建分类

左侧 menu 还是 menubody 加 router 属性，点击跳转
/categories/create
一定要加/在最前面，否则是会接 url

### admin 管理端

1. 模块是 router 子模块,因此 mainvue 右侧添加 routerview，
   靠 routerjs 里的子路由跳转
2. @submit.native.prevent="save" 阻止表单默认跳转，提交时调用 save 方法,发送 axios 请求(安装 axios 包)
3. 新建数据请求接口文件 http.js，新建 axios 实例，挂载到 appvue 下，原型上
   $http 可以任意调用请求接口
4. 完成 admin 的 server
5. categoryedit.vue 里发送请求收到数据，路由跳转到 list 页面

### server 服务端

写接口配置

1. server/indexjs 头文件，引用 express cors mongoose，引用数据库 dbjs，引用路由

```
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

```

2. routes/admin 后端路由 ,indexjs 存放后端路由配置
   定义==子==路由，调用数据库

```
  // admin 路由  -》》子路由
// 导出函数app，{}是传入的参数
module.exports = (app) => {
 const express = require("express");
 // 子路由
 const router = express.Router();

 // 调用mongoose模型
 const Category = require("../../models/Category");

 // 接收到post请求引用数据库
 router.post("/categories", async (req, res) => {
   const model = await Category.create(req.body);
   res.send(model);
 });

 app.use("/admin/api", router);
};
```

3. 数据库也单独定义文件，plugins/db.js
4. 数据库模型单独定义，放在 models/categoryjs 需要的时候引入即可

## 分类列表展示

### admin

1. 新建 categorylist 子路由跳转
2. 在 created 里发送 axios get 请求，获得数据库数据，用来渲染
3. 配置思路和 create 相同，==注意 async await==

## 编辑分类

1. elementui 添加按钮跳转(和之前的想法一样), 点击按钮跳转页面
2. 【！！】到前端 router/indexjs 里添加子路由，==注明 props = true【跟路由解耦】==， 在子组件里可以接收并使用传来的参数【编辑新增==共用【不用建两个几乎一样的组件】==一个 categoryedit.vue 组件】
   前端路由携参跳转

```
 <el-button @click="$router.push(`/categories/edit/${scope.row._id}`)" type="primary" size="small">编辑</el-button>
```

3. editvue 组件 created(){}自动执行方法：【如果有 id】去获取，显示, 编写后端接口返回数据给前端渲染
4. 【！！】==修改==保存功能：

   1. 新建是 post 修改是 put【条件判断】

   ```
     router.put("/categories/:id", async (req, res) => {
   // 两个参数

   const model = await Category.findByIdAndUpdate(req.params.id, req.body);
   console.log(model);
   res.send(model);
   });
   ```

```
==【是req不是this！不要写错this.params】==

```

## 删除分类

1. 类似 edit，但是不是跳转路由到 newvue，而是调用方法删除
2. 【！！】删除前有个==对话框==
   ==【async await】==
   这里有两个 await 一个 async
   ````
   async remove(item) {
       // 弹窗
       this.$confirm(`是否要删除"${item.name}"`, "提示", {
           confirmButtonText: "确定",
           cancelButtonText: "取消",
           type: "warning",
       })
           .then(async () => {
           await this.$http.delete(`/categories/${item._id}`);
           this.$message({
               type: "success",
               message: "删除成功!",
           });
           this.init();
           })
           .catch(() => {
           this.$message({
               type: "info",
               message: "已取消",
           });
           });
       // 重新渲染获取数据
       },
       ```
   ````

## 子分类

想要在分类列表里管理所有的分类，展示他们的关系
数据库里有字段表明父级，从而形成链式结构
==【!!】永远做 id 的关联==

1. editvue 的上级分类做下拉菜单
   1. created()里获取，到后台接口请求->get
   2. 数据渲染
   ```javascript
   <el-form-item label="上级分类">
        <el-select v-model="model.parent"
          ><el-option
            v-for="item in parents"
            :key="item._id"
            :label="item.name"
            :value="item._id"
          ></el-option
        ></el-select>
      </el-form-item>
   ```
   label 显示什么，value 选择的时候关联的是什么
   当未选择时，model.parent 为空，选择时，model.parent === item.\_id
   ==【时刻都是关联 id】==
2. 修改后端模型 -》》添加 parent
   ```
   const schema = new mongoose.Schema({
   name: {
   type: String,
   },
   parent: {
   type: mongoose.SchemaTypes.ObjectId,
   ref: "Category",
   },
   });
   ```
   ==！！==
   关联的正确姿势：一定要保存*关联*的 id，这样修改名称的时候，不用修改关系，否则会找不到关联！！，同时指定 ref 表示关联的模型
3. 展示上级分类的名称，修改后端接口:
   ==【！！】==populate 关联查询，根据 parent，返回一个关联的 object -》可以获取到 name 显示

   ```
     router.get("/categories", async (req, res) => {
   const items = await Category.find().populate('parent').limit(10);
   res.send(items);
   });

   ```

   那么展示的时候 parent 变 parent.name
   可以在任意分类下添加子分类

## 【！！】通用 CRUD 接口【通用性+扩展性】

模型《-》路径

命名规范：
路径：小写负数
类名：大写单数

解决方法：
用包 inflection

==【！！】==
【链式调用】【中间件的用法】

1. router/admin/index.js 下：使用中间件引入 model，绑定到 req.model 上
   ```
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
   ```

````

2. 修改关联查询-》因为有的接口不需要parent关联查询
modelName : 一个属性
如果是category，添加关联parent，否则什么都不做
  ```
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
````

## 装备管理

在通用 CRUD 写好后就很容易了

1. 赋值 categoryitem categorylist 修改，前端修改路由
2. 后端接口处没有 Item 模型，加模型 Item.js -》（name + icon）
   icon :不直接把图片上传，而是把图片上传到平台，保存提供的是图片地址路径(html)

## 图片上传

1. 上传-》 后台-》保存 -》返回给前端-》html 里显示
   即： onsuccess -》赋值给 model.icon
   【必须给==完整地址==，icon 上传用的是自带的 axios，不是我们的$http】-> 动态绑定:action="$http.defaults.baseURL + '/upload'"
   ```
      <el-upload
          class="avatar-uploader"
          :action="$http.defaults.baseURL + '/upload'"
          :show-file-list="false"
          :on-success="afterUpload"
        >
          <img v-if="model.icon" :src="model.icon" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
   ```
2. 后端 ： 传来的字段名是 file
   1. 新建 app.use 路径
   2. 安装 multer 中间件 ，允许接口处理上传文件，处理图片。
      一定要加 multer 才会有 req.file
      server ->> index.js

```
  const multer = require("multer");

  const upload = multer({ dest: __dirname + "/../../uploads" });
  // 中间件upload 允许接受字段名file得单个文件

  app.post("/admin/api/upload", upload.single("file"), async (req, res) => {
    // 借助multer req才有file，
    const file = req.file;
    res.send(file);
  });


```

3. ==【！！】托管静态文件==
   server/indexjs 里：

```

// uploads下静态文件托管 ，通过/uploads可以访问
app.use("uploads", express.static(__dirname + "/uploads"));
```

4. 返回文件路径

admin/indexjs 里：

```
app.post("/admin/api/upload", upload.single("file"), async (req, res) => {
    // 借助multer req才有file，
    const file = req.file;
    file.url = `http://localhost:3000/uploads/${file.filename}`;
    res.send(file);
  });
```

5.  【！！】前端接受 url ，显示图片
    ==数据响应式==
    this.$set 显式赋值 数据响应
    ```
        afterUpload(res) {
       // console.log(res);
       this.$set(this.model, "icon", res.url);
     },
    ```
    ==src 动态绑定千万别忘了冒号==
    ````
    <el-table-column prop="icon" label="物品图片">
    <template slot-scope="scope"
              ><img :src="scope.row.icon" alt="" style="height: 3 rem"
            /></template>
    </el-table-column>
          ```
    ````
