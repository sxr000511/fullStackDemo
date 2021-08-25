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

## 图片上传(利用 multer)

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

## 英雄管理

赋值 itemlist itemedit
为 herolist heroedit
添加前端路由，后端模型，修改 data 即可

## 编辑英雄 【设计数据结构，关注命名规范】【数据库的关联,多选,el-select, multiple】

1. 数据类型 Hero 的定义

   1. category 表关联 一个英雄关联多个分类

   ```
     categories: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Category' }],
   ```

   2. Object scores -》 4 个 key-value

   ```
     scores: {
    difficult: { type: Number },
    skills: { type: Number },
    attack: { type: Number },
    survive: { type: Number },
   },
   ```

   3. partners ： 关联 hero 再加一个 key:description， 多了一个字段

   ```
       partners: [
   {
   hero: { type: mongoose.SchemaTypes.ObjectId, ref: "Hero" },
   description: { type: String },
   },
   ],

   ```

2. 编辑 admin 页面

   1. '类型' 是 v-for 循环出来的下拉多选菜单
      created 时先从后端获得所有的 categories（可修改）
      由于 hero 的模型保存的时 categories 的 id，并且和 categories 关联，可以直接取出 id 对应的 name

   ```
       <el-form-item label="类型"
       ><el-select v-model="model.categories" multiple>
         <el-option
           v-for="item of categories"
           :key="item._id"
           :label="item.name"
           :value="item._id"
         >
         </el-option></el-select
     ></el-form-item>
   ```

   2. 难度的绑定
      model 里的 score 可能为空，取不到 model.score.difficult
      ==【！！】==如果直接给 data 添加一个 scores 空对象，会被 init()覆盖
      那么用：==assign==

   ```
   async init() {
      const res = await this.$http.get(`/rest/heros/${this.id}`);
      // this.model = res.data;
        // 注意升级
      this.model = Object.assign({}, this.model, res.data);
    },
    async initCategories() {
      const res = await this.$http.get(`/rest/categories`);

      this.categories = res.data;
      // this.model = Object.assign({}, this.model, res.data);
    },
   ```

     <!-- rate组件要求difficult默认是空字符串 -->

```
data() {
    return {
      categories: [],
      model: {
        name: "",
        avatar: "",
        scores: {
          difficult: "",
        },
      },
    };
  },
```

3. 技能，攻击，生存：同上
4. 顺风出装： 同 categories， 先 data 里定个 items， 再 created()时候到后端获取 items ，下拉多选

## 技能编辑

1. el-tabs 组合整理界面
2. el-colm 循环的 model.skills 数组 , 数组里的 obj 是技能详情
   ` <el-col :md="12" v-for="(item, i) in model.skills" :key="i">`

   1. 数据结构如下：

      ```
      skills: [
      {
      icon: { type: String },
      name: { type: String },
      delay: { type: String },
      cost: { type: String },
      description: { type: String },
      tips: { type: String },
      },
      ],
      ```

      点击按钮新添加技能 obj{}

      ```
       <el-button size="small" @click="model.skills.push({})">
            <i class="el-icon-plus"></i> 添加技能
          </el-button>

      ```

   2. 给 form-item 绑定到对应的数据上 比如 icon name etc...
   3. 显式赋值 $set

   4. 删除 -》 就是删除 skills 数组里的 object 元素 SPLICE 方法

   ```
       <el-form-item>
     <el-button
       size="small"
       type="danger"
       @click="model.skills.splice(i, 1)"
       >删除</el-button
     >
   </el-form-item>
   ```

## 文章管理，富文本编辑器

1. 组件：articleedit articlelist 数据模型
2. 文章分类是数组[]
3. ==【！！】==文章详情：富文本编辑器(后台可视化编辑) quil -》vue2editor
4. import {~~} from ~~~ 解构写法
   原理：html 标签形成 加一些样式
5. 上传图片：二进制数据 -》》img url
6. ==【！】==原始是转换成了二进制文件-》庞大
7. 组件修改：方法 handleimageadded
   ```
   <vue-editor
   v-model="model.body"
   useCustomImageHandler
   @image-added="handleImageAdded" ></vue-editor>
   ```
8. 修改上传的字段名 -》》 file(binary)
9. 调用 this.$http.upload 自己定义的 axios 方法(await 替代 promisethen，很简洁)
   ```
   async handleImageAdded(file, Editor, cursorLocation, resetUploader) {
     const formData = new FormData();
     <!-- 字段名file -->
     formData.append("file", file);
     // 调用自己的axios接口
     const res = await this.$http.post("upload", formData);
     // 模仿原来他的代码
     Editor.insertEmbed(cursorLocation, "image", res.data.url);
     resetUploader();
   },
   ```

## 首页广告管理

1. 广告的数据模型：数组存储【对象】：
   跳转链接 url，
   图片 img

```
const schema = new mongoose.Schema({
name: { type: String },
items: [
  {
    image: { type: String },
    url: { type: String },
  },
],
});
```

2. 广告元素 items: 模仿'英雄技能界面'
3. 注意 data 里初始化空元素防止找不到、 注意不能直接幅值(会覆盖)，用合并
4. 修改全局 css : 上传图片的样式全局通用，限高

## ==【权限】==管理员账号管理【bcryptjs】

先建模型再写页面

1. 新增一个模型
   ==【！！】==密码不能用明文存储 -> 散列保存
   在 server【服务器】 安装 bcryptjs 包
   不是 admin
   1. set 方法 接受一个值 return 一个值，这里做散列
      用到【模块 bcrypt】做散列，hashSync 同步方法
   2. select false ： 不能被查出来的 keyvalue

```

const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: { type: String },
  password: {
    type: String,
    select: false,
    set(val) {
      return require('管理员账号管理【bcryptjs】').hashSync(val, 10)
    }
  },
})

module.exports = mongoose.model('AdminUser', schema)
```

## 登陆页面

1. router 添加登录页（单独的平级页面）
2. login.vue
3. data: model 绑定 -》 model.username model.password
4. server/index 写接口
   收数据校验返回 token，实现鉴权
   ==解构赋值==req.body 里的 name 和 pswd 数据库查询
   【是根据 usname 去找，因为密码被散列了】

   1. 引用 user 模型
      findone 找一条
      assert 返回错误的 code 和 message ，它们在前端捕获显示【坑：必须 express5】
      http-assert 包 抛出信息

   ```
   app.post('/admin/api/login', async (req, res) => {
   const { username, password } = req.body
   // 1.根据用户名找用户
   const user = await AdminUser.findOne({ username }).select('+password')
   <!-- 直接抛出错误，最后中间件处理【错误处理】 -->
   assert(user, 422, '用户不存在')
   // 2.校验密码
   const isValid = require('bcrypt').compareSync(password, user.password)
   assert(isValid, 422, '密码错误')
   // 3.返回token
   const token = jwt.sign({ id: user._id }, app.get('secret'))
   res.send({ token })
   })
   ```

   2. ==【！！】==http 里全局捕获 err

   ```
   // 拦截器-》》响应拦截
   http.interceptors.response(
   (res) => {
    return res;
   },
   (err) => {
    // 保险：有才执行
    if (err.response.data.message) {
      // 状态码》400 进入err
      // promise.reject 抛回err
      // vue -》element ui 的style
      Vue.prototype.message({
        type: "error",
        message: err.response.data.message,
      });
      return Promise.reject(err);
    }
   }
   );
   ```

   根据 err 让客户端显示不同文字
   并且不需要让每个页面都监听 err，

   3. ==【！！】==token
      利用 jsonwebtoken 模块（server 安装）做 webtoken 验证，生成 token 返回
   1. 【在全局设置一个 secret 用作密钥】
   1. 路由里用 app.get('secret')可以获得
   1. 前端保存 token -》 localstorage 保存

   ```
    async login() {
   const res = await this.$http.post("login", this.model);
   //   得到返回的token，存到loalstorage里
   // sessionStorage.token = res.data.token
   localStorage.token = res.data.token;
   this.$router.push("/");
   this.$message({
     type: "success",
     message: "登录成功",
   });
   },
   ```

5. ==【！！】【中间件封装】==页面校验(后端接口权限) token -》有 token 才能进入
   1. 在请求头 request headers 里添加用户信息【'bearer ' + token】
      httpjs 里：

```
http.interceptors.request.use(function (config) {
  // Do something before request is sent
  if (localStorage.token) {
    <!-- bearer行业规范 -->
    config.headers.Authorization = 'Bearer ' + localStorage.token
  }
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});
```

2. 登录校验中间件==封装==【考虑中间件的扩展，写一个函数返回函数，调用函数使用中间件】
   indexjs 里

```
 // 登录校验中间件
const authMiddleware = require('../../middleware/auth')
const resourceMiddleware = require('../../middleware/resource')
<!-- 小括号执行函数 -->
app.use('/admin/api/rest/:resource', authMiddleware(), resourceMiddleware(), router)

const multer = require('multer')
const MAO = require('multer-aliyun-oss');
const upload = multer({
  // dest: __dirname + '/../../uploads',
  storage: MAO({
    config: {
      region: 'oss-cn-zhangjiakou',
      accessKeyId: '替换为你的真实id',
      accessKeySecret: '替换为你的真实secret',
      bucket: 'node-vue-moba'
    }
  })
})
```

auth 里 : 函数接收参数， return 一个函数 注意 require ，路径
req.app 得到 app

```
module.exports = (options) => {
  <!-- 注意路径 -->
  const assert = require("http-assert");
  const jwt = require("jsonwebtoken");
  const AdminUser = require("../models/AdminUser");

  return async (req, res, next) => {
    const token = String(req.headers.authorization || "")
      .split(" ")
      .pop();
    assert(token, 401, "请先登录");
    const { id } = jwt.verify(token, req.app.get("secret"));
    assert(id, 401, "请先登录");
    req.user = await AdminUser.findById(id);
    assert(req.user, 401, "请先登录");
    await next();
  };
};

```

resource.js 里

```
module.exports = (options) => {
  return async (req, res, next) => {
    const modelName = require("inflection").classify(req.params.resource);
    req.Model = require(`../models/${modelName}`);
    next();
  };
};
```

6. ==【！！】==错误处理中间件:index 里面直接抛出异常，最后中间件捕获异常，自己选择处理方法：err.statuscode

```
  // 错误处理函数
  app.use(async (err, req, res, next) => {
    // console.log(err)
    res.status(err.statusCode || 500).send({
      message: err.message
    })
  })
```

7. 前端根据错误信息跳出提示信息
8. ==【！！】==路由元信息 和 导航守卫
   1. meta 路由元信息
      router->index.js 里 ==【meta】==

```
 {
    path: "/login",
    name: "login",
    component: Login,
    meta: { isPublic: true },
  },
```

2. beforeeach 导航首位 ，注意判断条件

```
router.beforeEach((to, from ,next) => {
if (!to.meta.isPublic && !localStorage.token) {
  return next('/login')
}
next()
})
```

9. mixin 混入 让每个 vue 实例都有
   1. UPLOAD 组件提交用的是 ajax 底层库，不能用 axios 了
      用全局 mixin 使每个组件获得 authorization(method)
      再在每个 vue 组件 upload 里绑定 uploadurl 和 getauthheaders，
      上传图片时，获得 authorization，通过 authMiddleware()
   2. 计算属性节省代码 ：this.$http.defaults.baseURL + "/upload"
      不用每次都写

```
Vue.mixin({
  computed: {
    uploadUrl() {
      return this.$http.defaults.baseURL + "/upload";
    },
  },
  methods: {
    getAuthHeaders() {
      return {
        Authorization: `Bearer ${localStorage.token || ""}`,
      };
    },
  },
});
```

# web 移动端网站

## SASS (SCSS)

## 第一步：重置样式 box

1. 必加： box-sizing ：border-box -》》以 border 为准，不撑大盒子，而是挤压内容
2. html 根元素
3. rem 以 html 根元素为准 -》13px

4. body 充值 ：
5. 无 margin，
6. 字体 font-family
7. 行高 1.2 em 当前字体 1.2 倍
8. 灰色背景

```
// reset
* {
  box-sizing: border-box;
  outline: none;
}
html {
  font-size: 13px;
}
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.2em;
  background: #f1f1f1;
  -webkit-font-smoothing: antialiased;
}
a {
  color: #999;
}
p {
  line-height: 1.5em;
}
```

## 第二步：网站色彩整体 color text【助手工具类】

1. 网站主要颜色：变量定义
2. ==【工具类】== @each 循环生成工具类 -》color text
   ,$变量,
   注意是否加#

```
@each $colorKey, $color in $colors {
  .text-#{$colorKey} {
    color: $color;
  }
  .bg-#{$colorKey} {
    background-color: $color;
  }
}
// text align
@each $var in (left, center, right) {
  .text-#{$var} {
    text-align: $var !important;
  }
}

```

3. ==【工具类】== @each 循环生成工具类 -》font-size
   相对于 rem 的大小，两个变量，乘积控制
   ->>>>xxs，xs，~~~，xl，etc

   ```
   $base-font-size: 1rem;
   $font-sizes: (
   xxs: 0.6154,
   xs: 0.7692,
   //10px
    sm: 0.9231,
   //12px
    md: 1,
   //13px
    lg: 1.0769,
   //14px
    xl: 1.2308,
   //16px,,,,
   );
   ```

   ```
   // 乘积比例
   @each $sizeKey, $size in $font-sizes {
    .fs-#{$sizeKey} {
      font-size: $size * $base-font-size;
    }
   }
   ```

## 第三步：网站 flex 布局整体【助手工具类】

使用广泛，基本全兼容
需要用 flex 的时候就可以调用 d-flex

```
// flex
.d-flex {
  display: flex;
}

```

<!-- 循环生成代码 -->

```
$flex-jc: (
  start: flex-start,
  end: flex-end,
  center: center,
  between: space-between,
  around: space-around,
);

```

```
@each $key, $value in $flex-jc {
  .jc-#{$key} {
    justify-content: $value;
  }
}

```

## 第四步：常用边距整体定义 (margin, padding)

spacing，定义几种标准边距，上右下左
.MT -1 含义是=》margin top 一级
两层循环

```
  @each $directionKey, $direction in $spacing-directions {
    @each $sizeKey, $size in $spacing-sizes {
      <!-- .mt-1 -->
      <!-- margin-top:~~~ -->
      .#{$typeKey}#{$directionKey}-#{$sizeKey} {
        #{$type}-#{$direction}: $size * $spacing-base-size;
      }
    }
  }
```

## 页面设计：主页框架和顶部菜单

顶部不是每个页面都有，不能写在 appvue 入口页面

1. 新建 mainvue 做入口框架【bar + nav +routerview】，home 是真正的主页
   路由如下

```
const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
    children: [
      {
        path: "/",
        name: "home",
        component: Home,
      },
    ],
  },
  {
    ~~~~
  },
];
```

2. topbar 里 中间的 div 在 flex 里占的大，把两边撑开 -》》加个 class flex-1
3. nav 里

```
    <!-- nav模块 -->
    <div class="nav bg-primary py-2">
      <div class="nav">
        <div class="nav-item"><router-link></router-link></div>
      </div>
    </div>
```

router-link 默认生成 a 标签 -> tag:div

1. 设计 bottom line : 普通底部透明【为了保证对其】，active 底部白色 ，& 表示上一层的本身

```
// nav
.nav {
display: flex;
.nav-item {
  border-bottom: 3px solid transparent;
  padding-bottom: 0.2rem;
  &.active {
    color: map-get($colors, 'primary');
    border-bottom-color: map-get($colors, 'primary');
  }
}
&.nav-inverse {
  .nav-item {
    color: map-get($colors, 'white');
    &.active {
      border-bottom-color: map-get($colors, 'white');
    }
  }
}

}
```

## 幻灯片 swiper 组件 vueawesomeswiper

1. vue-awesome-swiper + swiper 组件,全局引用
2. 加右下角的点：swiperoption + pagenation 1. style 里变量引用分离 2. 配置有坑
   ```
   import Swiper2, { Navigation, Pagination } from "swiper";
   Swiper2.use([Navigation, Pagination]);
   ```
3. sass: 被包含的文件下划线\_开头，引用他的时候不用加下划线

## 中间部分： 精灵图(spritecow)

1. v-for 循环生成
2. .nav-icons ->> .nav-item 样式
3. style.css -> sprite 1. ==【！！】==注意二倍像素 ：bgrd-size ：375 虽然图片 750 2. i 标签 -》》inline-block 3. ==【！！】==sprite 定位 -》sprite-cow http://www.spritecow.com/

   ```
   // sprite
   .sprite {
   background: url(../images/index.png) no-repeat 0 0;
   background-size: 28.8462rem;
   display: inline-block;
   &.sprite-news {
   width: 1.7692rem;
   height: 1.5385rem;
   background-position: 63.546% 15.517%;
   }
   &.sprite-arrow{
   width: 0.7692rem;
   height: 0.7692rem;
   background-position: 38.577% 52.076%;
   }
   }

   ```

4. border style
   4n ： 没有右边框 -》选择器

```
.nav-icons {
  border-top: 1px solid $border-color;
  border-bottom: 1px solid $border-color;
  .nav-item {
    width: 25%;
    border-right: 1px solid $border-color;
    &:nth-child(4n) {
      border-right: none;
    }
  }
}
```

5. 边框

## 使用【字体图标】 (iconfont)

https://www.iconfont.cn/

1. 下载代码
2. mainjs 里引用
3. 使用见文件夹里的 html

## ==【常用】==卡片组件(card)

图标 + 名称 -》》+》》链接
==【封装 nav + swiper(文章)】==
头部可以封装，内容不行

1. components -> listcard + card

   1. card : tittle + icon 来自传参
      【card 构成了卡片布局最上面的 header】
      【主体是一个 slot，会放入 listcard】

2. mainjs 里全局引用

```
import Card from './components/Card.vue'
Vue.component('m-card', Card)

```

## ==【常用】==卡片组件(Listcard)

1. listcard 由 card 而来，是 card 的 slot
2. listcard 主要构成了卡片布局里的 tab 和下面的 swiper 组件
3. listcard swiper 里面的单条 category 由==作用于插槽==传回给 homevue【子传父】
4. 父组件 home.vue 里：==【父组件可以决定子组件每一个循环体的 style】==
   1. listcard-》card 组件调用形成 head，自己形成 tab 和 slide
   2. 【外部获得每个 category 循环 v-for 显示，一行一行的文字】
   ```
      <m-list-card icon="category" title="新闻资讯" :categories="newsCats">
     <!-- 作用域插槽 -->
     <!-- 通过#获得子组件slot绑定的category -->
     <template #items="{category}">
       <router-link
       tag="div"
       :to="`/articles/${news._id}`"
       class="py-2 fs-lg d-flex"
       v-for="(news, i) in category.newsList" :key="i">
         <span class="text-info">[{{news.categoryName}}]</span>
         <span class="px-2">|</span>
         <span class="flex-1 text-dark-1 text-ellipsis pr-2">{{news.title}}</span>
         <span class="text-grey-1 fs-sm">{{news.createdAt | date}}</span>
       </router-link>
     </template>
   </m-list-card>
   ```

## 首页新闻资讯-数据录入(+后台 bug 修复)

1. 修改后台 bug：后台 admin
   让 routerview 以 route 做区分，' <router-view :key="$route.path"></router-view>'
2. 完善前端 web 页面：吸顶

   ```
   <style lang="scss">
   .topbar {
   position: sticky;
   top: 0;
   <!-- 层级变高 -->
   z-index: 999;
   }
   </style>
   ```

   3.== 【！！】==从后台录入信息： 分类 和 新闻

   1. 热门不算新闻分类的子分类
   2. ==录入信息的神操作== -》》 mongodb 教程
      由此每次访问 web/api/news/init 接口都会清空 article 表然后放入新随机的 article

   ```
       // 导入新闻数据
   router.get('/news/init', async (req, res) => {
     // 每次调用init接口都会清空article 插入随机的数据
   const parent = await Category.findOne({
     name: '新闻分类'
   })
   //   获得新闻分类下的所有子分类
   const cats = await Category.find().where({
     parent: parent
   }).lean()
   //   数据
   const newsTitles = ["夏日新版本“稷下星之队”即将6月上线",..."]
   //  map方法处理数组news，给他们随机的两个分类
   const newsList = newsTitles.map(title => {
     //   sort 随机分类
     const randomCats = cats.slice(0).sort((a, b) => Math.random() - 0.5)
     return {
       categories: randomCats.slice(0, 2),
       title: title
     }
   })
   //   清空article
   await Article.deleteMany({})
   //   插入
   await Article.insertMany(newsList)
   res.send(newsList)
   })
   ```

## ==【！！】==首页新闻资讯-数据接口

1.  articlejs 模型里增添==虚拟字段==

```
// 虚拟字段newslist
schema.virtual("newsList", {
localField: "_id",
foreignField: "categories",
justOne: false,
ref: "Article",
});
```

2.  web/indexjs 中: 两次 polulate 关联
    先从 top 分类-》关联到子分类-》子分类下的 newslist(用虚拟外键)获得 articlelist
1.  不好：

```
    router.get('/news/list', async (req, res) => {
    // const parent = await Category.findOne({
    // name: '新闻分类'
    // }).populate({
    // path: 'children',
    // populate: {
    // path: 'newsList'
    // }
    // }).lean()
    }
```

2.  更好：

    1. mongo 聚合查询 aggregate，一次操作多次查询，具有管道（一次完成三个操作）
       ```
       const cats = await Category.aggregate([
         <!--1.过滤 匹配 -->
       { $match: { parent: parent._id } },
         <!-- { 2. 相当于join 左关联接，起个名字 newslist-->
           $lookup: {
             from: 'articles',
             localField: '_id',
             foreignField: 'categories',
             as: 'newsList'
           }
         },
         {
           <!-- 添加字段 -》3.  修改字段，只要5个-->
           $addFields: {
             newsList: { $slice: ['$newsList', 5] }
       }
       }
       ])
       ```
    2. 增添：热门

    ```
        //   只要_id ，返回v._id
    const subCats = cats.map(v => v._id)
    cats.unshift({
      name: '热门',
      newsList: await Article.find().where({
        categories: { $in: subCats }
      }).populate('categories').limit(5).lean()
    })


    // 热门下的 article 要保存自己本来的 category
    // 其他的还是自己的 category
    // 三元运算符做判断
    cats.map(cat => {
    cat.newsList.map(news => {
    news.categoryName = (cat.name === '热门')
    ? news.categories[0].name : cat.name
    return news
    })
    return cat
    })
    res.send(cats)

    ```

3.  web 安装引入 axios , 再 mainjs 里挂载

```
import axios from 'axios'
Vue.prototype.$http = axios.create({
  // baseURL: process.env.VUE_APP_API_URL || '/web/api'
  baseURL: 'http://localhost:3000/web/api'
})
```

4.  homevue 交互：
1.  滑动时更新 tab 状态 -》》 slide-change 事件 ，realindex 属性
    ` @slide-change="() => (active = $refs.list.$swiper.realIndex)"`
1.  点击 tab-》绑定 slideto  
    ` @click="$refs.list.$swiper.slideTo(i)"`
1.  安装 dayjs 包解析事件戳

```
  filters: {
  date(val) {
    return dayjs(val).format("MM/DD");
  },
},
```

## 首页英雄列表-提取官网数据

接口 heroes/init

```
  // 导入英雄数据
  router.get("/heroes/init", async (req, res) => {
    await Hero.deleteMany({});
    // rawdata 是【{ category + heroslist}】
    const rawData = [
      {
        name: "热门",
        heroes: [
          {
            name: "后羿",
            avatar:
              "https://game.gtimg.cn/images/yxzj/img201606/heroimg/169/169.jpg",
          },...{}
    ];
    for (let cat of rawData) {
      if (cat.name === "热门") {
        continue;
      }
      // 找到当前分类在数据库中对应的数据
      const category = await Category.findOne({
        name: cat.name,
      });
      cat.heroes = cat.heroes.map((hero) => {
        <!-- 新字段categories -->
        hero.categories = [category];
        return hero;
      });
      // 录入英雄
      await Hero.insertMany(cat.heroes);
    }

    res.send(await Hero.find());
  });
```

## 首页英雄列表-界面展示

1. 列表接口类似文章列表

```
// 英雄列表接口
  // 类似文章接口
  // 注意es
  router.get("/heroes/list", async (req, res) => {
    const parent = await Category.findOne({
      name: "英雄",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "heroes",
          localField: "_id",
          foreignField: "categories",
          // as -》 作为herolist
          as: "heroList",
        },
      },
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门",
      heroList: await Hero.find()
        .where({
          categories: { $in: subCats },
        })
        .limit(10)
        .lean(),
    });

    res.send(cats);
  });
```

2. web 展示

## 新闻详情页

1. 新增路由 ` { path: "/articles/:id", name: "article", component: Article, props: true, },`
   携带 id
2. homevue routerlink 带 id 跳转路由

```
        <router-link
          tag="div"
          :to="`/articles/${news._id}`"
          class="py-2 fs-lg d-flex"
          v-for="(news, i) in category.newsList"
          :key="i"
        >
```

3. article.vue
   v-if 防报错 没 model 就不要渲染，等 fetch 到了再渲染

```
 watch: {
    //   监听id
    id: 'fetch',
    // id(){
    //   this.fetch()
    // }
  },
```

4. 接口：

```
    // 文章详情
    router.get("/articles/:id", async (req, res) => {
      const data = await Article.findById(req.params.id).lean();
      data.related = await Article.find()
        .where({
          categories: { $in: data.categories },
        })
        .limit(2);
      res.send(data);
    });
```

## 英雄详情页 hero.vue

同样接受 id
vue 页面不一样的地方：【 header 样式改变了(部分改变)】
那么 herovue 不是 homevue 的 children
router 中：
` {path: '/heroes/:id', name: 'hero', component: Hero, props: true},`

1. 重写 topbar，注意转义符

```
      <!-- 重写topbar 不用home的样式 -->
    <div class="topbar bg-black py-2 px-3 d-flex ai-center text-white">
      <img src="../assets/logo.png" height="30" />
      <div class="px-2 flex-1">
        <span class="text-white">王者荣耀</span>
        <span class="ml-2">攻略站</span>
      </div>
      <!-- gt 是》 转义符，防止html标签报错 -->
      <router-link to="/" tag="div">更多英雄 &gt;</router-link>
    </div>
```

2. 获取数据 v-if 判断(同上)
3. 写后台接口

```
// 英雄详情
  router.get("/heroes/:id", async (req, res) => {
    const data = await Hero.findById(req.params.id)
      .populate("categories items1 items2 partners.hero")
      .lean();
    res.send(data);
  });

```

4. 英雄 数据模型 加字段 banner(英雄背景图)
5. herovue 写界面
   v-if 保证存在再渲染
   防止报错

## 发布部署：生产环境编译

1. 域名问题 ： 源代码需要根据开发和编译替换 baseurl -》》 不含主机名的绝对地址
   域名是什么接口就是什么
   webpack 打包后有 process 变量，`process.env.VUE_APP_API_URL`是真正的接口地址，
   ```
   const http = axios.create({
   baseURL: process.env.VUE_APP_API_URL || '/admin/api',
   // baseURL: 'http://localhost:3000/admin/api'
   })
   ```
2. `.env.development`
   手动定义本地开发域名
   ```
   VUE_APP_API_URL = http://localhost:3000/admin/api
   ```
3. npm run build
   在 server 里放置 dist -》 作为 admin
   index 里静态文件托管【此处先托管到 3000 根下】

```
app.use("/", express.static(__dirname + "/admin"));
```

4. 至此通过 3000 可访问 admin

5. 不安全：
   1. 配置: outputdir -》 输出路径 ， publicpath ： 生产模式下加 admin，开发下不加

```

module.exports = {
outputDir: \_\_dirname + '/../server/admin',
publicPath: process.env.NODE_ENV === 'production'
? '/admin/'
: '/'
}

```

    2. 至此 admin 托管到了 3000/admin
