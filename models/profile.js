'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Profile.belongsTo(models.User)
      // define association here
    }
  }
  Profile.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'First name cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'First name cannot be empty.'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Last name cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Last name cannot be empty.'
        }
      }
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Gender cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Gender cannot be empty.'
        }
      }
    },
    UserId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'User cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'User cannot be empty.'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};