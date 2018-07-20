<template>
  <el-card class="box-card">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button class="el-btn" type="success" plain>添加角色</el-button>
    <el-table
      v-loading="loading"
      :data="list"
      style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row
            class="level1"
            v-for="item1 in scope.row.children"
            :key="item1.id">
            <el-col :span="4">
              <el-tag closable @close="handleClose(scope.row, item1.id)">
                {{ item1.authName }}
              </el-tag>
            </el-col>
            <el-col :span="20">
              <el-row
                v-for="item2 in item1.children"
                :key="item2.id">
                <el-col :span="4">
                  <el-tag type="success" closable @close="handleClose(scope.row, item2.id)">
                    {{ item2.authName }}
                  </el-tag>
                </el-col>
                <el-col :span="20">
                  <el-tag
                    class="level3"
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    type="warning"
                    closable
                    @close="handleClose(scope.row, item3.id)">
                    {{ item3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <el-row v-if="scope.row.children.length === 0">
            <el-col :span="24">
              未分配权限
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="roleName"
        label="角色名称"
        width="180">
      </el-table-column>
      <el-table-column
        prop="roleDesc"
        label="角色描述"
        width="180">
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" plain></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" plain></el-button>
          <el-button size="mini" type="warning" icon="el-icon-check" plain @click="handleChecked(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      v-loading="loading"
      title="提示"
      width="40%"
      :visible.sync="dialogVisible"
      @open="handleOpen">
      <el-tree
        ref="tree"
        :data="treeData"
        :props="defaultProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="checkedList">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleRoles">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      loading: false,
      dialogVisible: false,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      checkedList: [],
      currentRoleId: -1
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      const res = await this.$http.get('roles')
      const resData = res.data
      const { data, meta: { msg, status } } = resData
      if (status === 200) {
        this.loading = false
        this.list = data
      } else {
        this.$message.error(msg)
      }
    },
    async handleClose(role, rightId) {
      const res = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      const resData = res.data
      const { data, meta: {status, msg} } = resData
      if (status === 200) {
        this.$message.success(msg)
        role.children = data
      } else {
        this.$message.error(msg)
      }
    },
    async handleOpen() {
      this.loading = true
      const res = await this.$http.get('rights/tree')
      const resData = res.data
      const { data, meta: {status, msg} } = resData
      if (status === 200) {
        this.loading = false
        this.treeData = data
      } else {
        this.$message.error(msg)
      }
    },
    handleChecked(role) {
      this.currentRoleId = role.id
      this.dialogVisible = true
      const arr = []
      role.children.forEach((item1) => {
        item1.children.forEach((item2) => {
          item2.children.forEach((item3) => {
            arr.push(item3.id)
          })
        })
      })
      this.checkedList = arr
    },
    async handleRoles() {
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
      const newArray = [...checkedKeys, ...halfCheckedKeys]
      const ref = await this.$http.post(`roles/${this.currentRoleId}/rights`, {
        rids: newArray.join(',')
      })
      const refData = ref.data
      const { meta: { status, msg } } = refData
      if (status === 200) {
        this.dialogVisible = false
        this.$message.success(msg)
        this.loadData()
      } else {
        this.$message.error(msg)
      }
    }
  }
}
</script>

<style>
.el-btn {
  margin-top: 10px;
  margin-bottom: 10px;
}
.level1 {
  margin-bottom: 10px;
}
.level3 {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
