import axios from 'axios'

let MyAxios = {}

MyAxios.install = function (Vue) {
  var instance = axios.create({
    baseURL: 'http://localhost:8888/api/private/v1/'
  })
  Vue.prototype.$http = instance
}

export default MyAxios
