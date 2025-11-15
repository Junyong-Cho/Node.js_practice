// npx sequlize-cli model:generate --name File --attributes original_filename:string,stored_filename:string,file_size:integer,mime_type:string
// 위 명령어로 자동 생성된 파일
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  File.init({
    original_filename: DataTypes.STRING,
    stored_filename: DataTypes.STRING,
    file_size: DataTypes.INTEGER,
    mime_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'File',
    tableName: 'files'  // 테이블 이름 소문자로 설정
  });
  return File;
};