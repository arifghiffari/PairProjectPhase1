'use strict';
const {
  Model, sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {

    static async summarize() {
      const summarizeData = await this.findAll({
        include: [{
          model: sequelize.models.Product,
          attributes: []
        }],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Wishlist.id')), 'totalItems'],
          [sequelize.fn('SUM', sequelize.col('Product.price')), 'totalPrice']
        ],
        raw: true
      })
      return summarizeData[0]
    }
  
    get summary() {
      return Wishlist.summarize()
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Wishlist.belongsTo(models.User)
      Wishlist.belongsTo(models.Product)
      // define association here
    }
  }
  Wishlist.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
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
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Product cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Product cannot be empty.'
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Wishlist',
  });
  return Wishlist;
};