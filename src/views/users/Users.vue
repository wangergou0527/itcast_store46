<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索区域 -->
    <el-row class="searchArea">
      <el-col :span="24">
        <el-input class="searchInput" clearable placeholder="请输入内容" v-model="searchValue">
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
        <el-button type="success" plain @click="addUserDialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      stripe
      border
      :data="list"
      style="width: 100%">
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="username"
        label="姓名"
        width="100">
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="180">
      </el-table-column>
      <el-table-column
        prop="mobile"
        label="电话">
      </el-table-column>
      <el-table-column
        label="创建日期">
        <template slot-scope="scope">
          <!-- 当前行绑定到的数据对象 -- 用户对象 -->
          <!-- {{ scope.row }} -->
          <!-- <hr> -->
          <!-- 当前行的索引 -->
          <!-- {{ scope.$index }} -->
          <!-- <hr> -->
          <!-- 当前列的配置内容 -->
          <!-- {{ scope.column }} -->
          <!-- <hr> -->
          {{ scope.row.create_time | fmtDate('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column
        label="用户状态" width="100">
        <template slot-scope="scope">
          <!-- scope.row 就是当前行绑定的数据对象 -->
          <el-switch
            v-model="scope.row.mg_state"
            @change="handleSwitchChange(scope.row)"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button plain size="mini" type="primary" icon="el-icon-edit" @click="editBtn(scope.row)"></el-button>
          <el-button plain size="mini" type="danger" @click=handleDelete(scope.row.id) icon="el-icon-delete" ></el-button>
          <el-button plain size="mini" type="success" icon="el-icon-check" @click="setRoleBtn(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" @close="clearDialog">
      <el-form :model="formData" label-width="100px" :rules="formRules" ref="myForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="formData.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAdd">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑用户" :visible.sync="editUserDialogVisible" @close="clearDialog">
      <el-form :model="formData" label-width="100px" :rules="formRules" ref="myForm">
        <el-form-item label="用户名" prop="username">
          <el-input disabled v-model="formData.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" @close="clearDialog">
      <el-form label-width="100px">
        <el-form-item label="用户名" prop="username">
            {{ currentUserName }}
        </el-form-item>
        <el-form-item label="角色">
          <template>
            <el-select v-model="currentRoleId">
              <el-option disabled label="请选择" :value="currentRoleId">
              </el-option>
              <el-option
                v-for="item in roles"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSetRole">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      // 用户列表数据
      list: [],
      // true显示正在加载，false的时候不显示
      loading: true,
      pageSize: 2,
      pageNum: 1,
      total: 0,
      searchValue: '',
      addUserDialogVisible: false,
      editUserDialogVisible: false,
      setRoleDialogVisible: false,
      formData: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ]
      },
      currentUserName: '',
      currentRoleId: -1,
      currentUserId: -1,
      roles: []
    }
  },
  created() {
    // 发送请求获取数据
    this.loadData()
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
      this.loadData()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.loadData()
    },
    // 发送异步请求，获取数据
    async loadData() {
      // 发送异步请求之前
      this.loading = true

      // // 发送请求之前，获取token
      // const token = sessionStorage.getItem('token')
      // // 在请求头中设置token
      // this.$http.defaults.headers.common['Authorization'] = token

      const res = await this.$http.get(`users?pagenum=${this.pageNum}&pagesize=${this.pageSize}&query=${this.searchValue}`)

      // 异步请求结束
      this.loading = false

      // 获取响应数据
      const data = res.data
      // meta中的msg 和 status
      const { meta: { msg, status } } = data
      if (status === 200) {
        const { data: { users, total } } = data
        this.list = users
        this.total = total
      } else {
        this.$message.error(msg)
      }
    },
    handleSearch() {
      this.loadData()
    },
    async handleSwitchChange(user) {
      // console.log(user)
      const res = await this.$http.put(`users/${user.id}/state/${user.mg_state}`)
      const data = res.data
      const { meta: { status, msg } } = data
      if (status === 200) {
        this.$message.success(msg)
      } else {
        this.$message.error(msg)
      }
    },
    async handleDelete(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`users/${id}`)
        const data = res.data
        const { meta: { status, msg } } = data
        if (status === 200) {
          this.pageNum = 1
          this.loadData()
          this.$message.success(msg)
        } else {
          this.$message.error(msg)
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async handleAdd() {
      this.$refs.myForm.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请输入完整内容')
        }
        const res = await this.$http.post('users', this.formData)
        const data = res.data
        const { meta: { status, msg } } = data
        if (status === 201) {
          this.addUserDialogVisible = false
          this.$message.success(msg)
          this.loadData()
        } else {
          this.$message.error(msg)
        }
      })
    },
    clearDialog() {
      for (let key in this.formData) {
        this.formData[key] = ''
      }
    },
    editBtn(user) {
      this.editUserDialogVisible = true
      this.formData.username = user.username
      this.formData.mobile = user.mobile
      this.formData.email = user.email
    },
    async handleEdit() {
      this.$refs.myForm.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请输入完整内容')
        }
        const res = await this.$http.put(`users/${this.formData.id}`, {
          mobile: this.formData.mobile,
          email: this.formData.email
        })
        const data = res.data
        const { meta: { status, msg } } = data
        if (status === 200) {
          this.loadData()
          this.editUserDialogVisible = false
          this.$message.success(msg)
          for (let key in this.formData) {
            this.formData[key] = ''
          }
        } else {
          this.$message.error(msg)
        }
      })
    },
    async setRoleBtn(user) {
      this.setRoleDialogVisible = true
      const res = await this.$http.get('roles')
      this.roles = res.data.data
      this.currentUserName = user.username
      const res1 = await this.$http.get(`users/${user.id}`)
      this.currentRoleId = res1.data.data.rid
      this.currentUserId = user.id
    },
    async handleSetRole() {
      this.setRoleDialogVisible = false
      const res = await this.$http.put(`users/${this.currentUserId}/role`, {
        rid: this.currentRoleId
      })
      const data = res.data
      const { meta: { status, msg } } = data
      if (status === 200) {
        this.$message.success(msg)
      } else {
        this.$message.error(msg)
      }
    }
  }
}
</script>

<style>
.box-card {
  height: 100%;
}
.searchArea {
  margin-top: 10px;
  margin-bottom: 10px;
}
.searchArea .searchInput {
  width: 350px;
}
</style>
