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
    tableName: 'files'
  });
  return File;
};