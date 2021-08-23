<template>
  <div>
    <h1>{{ id ? "编辑" : "新建" }}英雄</h1>

    <el-form @submit.native.prevent="save">
      <el-tabs value="skills" style="border-card">
        <!-- tab基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <!-- <el-form-item label="上级分类">
        <el-select v-model="model.parent"
          ><el-option
            v-for="item in parents"
            :key="item._id"
            :label="item.name"
            :value="item._id"
          ></el-option
        ></el-select>
      </el-form-item> -->
          <el-form-item label="名称">
            <el-input v-model="model.name"></el-input>
          </el-form-item>
          <el-form-item label="头像">
            <!-- :action  -> 动态上传地址 -->
            <!-- onsucess 上传成功后 -->
            <el-upload
              class="avatar-uploader"
              :action="$http.defaults.baseURL + '/upload'"
              :show-file-list="false"
              :on-success="afterUpload"
            >
              <img v-if="model.avatar" :src="model.avatar" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
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
          <el-form-item label="难度">
            <el-rate
              style="margin-top: 0.6rem"
              :max="9"
              show-score
              v-model="model.scores.difficult"
            ></el-rate>
          </el-form-item>
          <el-form-item label="技能">
            <el-rate
              style="margin-top: 0.6rem"
              :max="9"
              show-score
              v-model="model.scores.skills"
            ></el-rate>
          </el-form-item>
          <el-form-item label="攻击">
            <el-rate
              style="margin-top: 0.6rem"
              :max="9"
              show-score
              v-model="model.scores.attack"
            ></el-rate>
          </el-form-item>
          <el-form-item label="生存">
            <el-rate
              style="margin-top: 0.6rem"
              :max="9"
              show-score
              v-model="model.scores.survive"
            ></el-rate>
          </el-form-item>

          <el-form-item label="顺风出装">
            <el-select v-model="model.items1" multiple>
              <el-option
                v-for="item of items"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="逆风出装">
            <el-select v-model="model.items2" multiple>
              <el-option
                v-for="item of items"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 文本框 -->
          <el-form-item label="使用技巧">
            <el-input type="textarea" v-model="model.usageTips"></el-input>
          </el-form-item>
          <el-form-item label="对抗技巧">
            <el-input type="textarea" v-model="model.battleTips"></el-input>
          </el-form-item>
          <el-form-item label="团战思路">
            <el-input type="textarea" v-model="model.teamTips"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" native-type="submit"
              >保存</el-button
            ></el-form-item
          >
        </el-tab-pane>

        <el-tab-pane label="技能" name="skills">
          <!-- 点击：在array里添加一个obj -->
          <el-button size="small" @click="model.skills.push({})">
            <i class="el-icon-plus"></i> 添加技能
          </el-button>
          <el-row type="flex" style="flex-wrap: wrap">
            <el-col :md="12" v-for="(item, i) in model.skills" :key="i">
              <el-form-item label="名称">
                <el-input v-model="item.name"></el-input>
              </el-form-item>
              <el-form-item label="图标">
                <el-upload
                  class="avatar-uploader"
                  :action="uploadUrl"
                  :headers="getAuthHeaders()"
                  :show-file-list="false"
                  :on-success="(res) => $set(item, 'icon', res.url)"
                >
                  <img v-if="item.icon" :src="item.icon" class="avatar" />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </el-form-item>
              <el-form-item label="冷却值">
                <el-input v-model="item.delay"></el-input>
              </el-form-item>
              <el-form-item label="消耗">
                <el-input v-model="item.cost"></el-input>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="item.description" type="textarea"></el-input>
              </el-form-item>
              <el-form-item label="小提示">
                <el-input v-model="item.tips" type="textarea"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  size="small"
                  type="danger"
                  @click="model.skills.splice(i, 1)"
                  >删除</el-button
                >
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>

      <el-form-item style="margin-top: 1rem">
        <el-button type="primary" native-type="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    id: {},
  },
  data() {
    return {
      categories: [],
      items: [],
      model: {
        name: "",
        avatar: "",
        skills: [],
        scores: {
          difficult: 0,
        },
      },
    };
  },
  methods: {
    async save() {
      // 发起axios post请求到items接口
      // then方法写成aysnc await 和后端一样
      // "http://localhost:3000/admin/api"+"heros"
      let res = null;
      if (this.id) {
        // 修改item,携带id
        console.log(this.model);
        res = await this.$http.put(`/rest/heros/${this.id}`, this.model);
      } else {
        // 新增item
        res = await this.$http.post("/rest/heros", this.model);
      }
      console.log(res);
      this.$router.push("/heros/list");
      this.$message({
        message: "添加成功",
        type: "success",
      });
    },
    async init() {
      const res = await this.$http.get(`/rest/heros/${this.id}`);
      // this.model = res.data;
      // 注意升级

      this.model = Object.assign({}, this.model, res.data);
    },
    async initCategories() {
      const res = await this.$http.get(`/rest/categories`);
      this.categories = res.data;
    },
    async initItems() {
      const res = await this.$http.get(`/rest/items`);
      this.items = res.data;
    },
    afterUpload(res) {
      // console.log(res);
      this.$set(this.model, "avatar", res.url);
    },
  },
  created() {
    this.initItems();
    this.initCategories();
    this.id && this.init();
  },
};
</script>

<style>
</style>