<template>
  <div>
    <h1>{{ id ? "编辑" : "新建" }}分类</h1>
    <el-form @submit.native.prevent="save">
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
      <el-form-item label="图标">
        <!-- :action  -> 动态上传地址 -->
        <!-- onsucess 上传成功后 -->
        <!-- 用mixin混入 -->
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :headers="getAuthHeaders()"
          :show-file-list="false"
          :on-success="afterUpload"
        >
          <img v-if="model.icon" :src="model.icon" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit"
          >保存</el-button
        ></el-form-item
      >
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
      model: {},
    };
  },
  methods: {
    async save() {
      // 发起axios post请求到items接口
      // then方法写成aysnc await 和后端一样
      // "http://localhost:3000/admin/api"+"items"
      let res = null;
      if (this.id) {
        // 修改item,携带id
        console.log(this.model);
        res = await this.$http.put(`/rest/items/${this.id}`, this.model);
      } else {
        // 新增item
        res = await this.$http.post("/rest/items", this.model);
      }
      console.log(res);
      this.$router.push("/items/list");
      this.$message({
        message: "添加成功",
        type: "success",
      });
    },
    async init() {
      const res = await this.$http.get(`/rest/items/${this.id}`);
      this.model = res.data;
    },
    afterUpload(res) {
      // console.log(res);
      this.$set(this.model, "icon", res.url);
    },
  },
  created() {
    this.id && this.init();
  },
};
</script>

<style>
</style>