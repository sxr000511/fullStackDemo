<template>
  <div>
    <h1>英雄列表</h1>

    <el-table :data="items">
      <el-table-column prop="_id" label="ID"> </el-table-column>
      <!-- 关联查询 -->

      <el-table-column prop="name" label="英雄名称"> </el-table-column>
      <el-table-column prop="avatar" label="英雄头像">
        <template slot-scope="scope"
          ><img :src="scope.row.avatar" alt="" style="height: 3rem"
        /></template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button
            @click="$router.push(`/heros/edit/${scope.row._id}`)"
            type="primary"
            size="small"
            >编辑</el-button
          >
          <el-button @click="remove(scope.row)" type="primary" size="small"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
    };
  },

  methods: {
    async init() {
      const res = await this.$http.get("/rest/heros");

      this.items = res.data;
    },

    async remove(item) {
      // 弹窗
      this.$confirm(`是否要删除"${item.name}"`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          await this.$http.delete(`/rest/heros/${item._id}`);
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
  },
  created() {
    this.init();
  },
};
</script>

<style>
</style>