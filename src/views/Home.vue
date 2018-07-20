<template>
  <el-container class="container">
    <el-header class="header">
      <el-row>
        <el-col :span="4">
          <img src="/static/logo.png">
        </el-col>
        <el-col class="middle" :span="19">
          <h2>电商后台管理系统</h2>
        </el-col>
        <el-col :span="1">
          <a class="logout" @click.prevent="handleLogout" href="#">退出</a>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside class="aside" width="200px">
         <el-menu
          :router="true"
          :unique-opened="true"
          class="menu">
          <el-submenu
            v-for="item1 in menus"
            :key="item1.id"
            :index="item1.id + ''">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{ item1.authName }}</span>
            </template>
            <el-menu-item
              v-for="item2 in item1.children"
              :key="item2.id"
              :index="'/' + item2.path">
              <i class="el-icon-menu"></i>
              {{ item2.authName }}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menus: []
    }
  },
  beforeCreate() {
    const token = sessionStorage.getItem('token')
    if (!token) {
      this.$router.push({ name: 'login' })
      this.$message.warning('请先登录')
    }
  },
  created() {
    this.handleData()
  },
  methods: {
    // 退出
    handleLogout() {
      // 删除sessionStorage中的token
      sessionStorage.clear()
      // 跳转到登录页
      this.$router.push({ name: 'login' })
      // 提示
      this.$message.success('退出成功')
    },
    async handleData() {
      const ref = await this.$http.get('menus')
      const refData = ref.data
      const { data, meta: { status, msg } } = refData
      if (status === 200) {
        this.menus = data
      } else {
        this.$message.error(msg)
      }
    }
  }
}
</script>

<style>
.container {
  height: 100%;
}

.header {
  background-color: #b3c0d1;
  padding: 2px;
}

.middle {
  padding-right: 150px;
  color: #fff;
  line-height: 60px;
  text-align: center;
}

.logout {
  text-decoration: none;
  line-height: 60px;
  color: orange;
}

.aside {
  background-color: #d3dce6;
}

.menu {
  height: 100%;
}

.main {
  background-color: #e9eef3;
}
</style>
