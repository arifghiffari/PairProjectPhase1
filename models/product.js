'use strict'
const {
  Model, Op
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static async getProductsByName(search) {
      try {
        let condition = {
          include: sequelize.models.Category,
          order: [['id', 'ASC']], 
        }
  
        if (search) {
          condition.where = {
            name: {
              [Op.iLike]: `%${search}%`
            }
          }
          condition.order = [['name', 'ASC']]
        }        
      
        const products = await Product.findAll(condition)
        return products
        
      } catch (error) {
        throw error
      }
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Category)
      Product.hasMany(models.Wishlist)
      Product.belongsToMany(models.User, {
        through: models.Wishlist
      })
      // define association here
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Name cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Name cannot be empty.'
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'ImageUrl cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'ImageUrl cannot be empty.'
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Price cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Price cannot be empty.'
        },
        min: {
          args: 1,
          msg: 'Price must be above than 0.'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Description cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Description cannot be empty.'
        }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Stock cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Stock cannot be empty.'
        },
        min: {
          args: 1,
          msg: 'Minimum stock is 1.'
        }
      }
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Category cannot be null.'
        },
        notEmpty: {
          args: true,
          msg: 'Category cannot be empty.'
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Product',
  })
  return Product
}