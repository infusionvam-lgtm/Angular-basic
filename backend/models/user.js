import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index.js';

class User extends Model {}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  }
);

export default User;



// Purpose of this file
// In Sequelize, a model represents a table in your database.
// Each model defines the structure (columns) and rules of that table.
// You can then use the model to create, read, update, delete (CRUD) data in that table without writing raw SQL.