require('dotenv').config()

module.exports = {
  development:{
    use_env_variable: 'DB_CONNECTION_STRING', // 개발 단계
    dialect: 'postgres'
  },
  production:{
    use_env_variable: 'DB_CONNECTION_STRING_P', // 배포 단계
    dialect: 'postgres'
  }
}