import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AdminAttributes {
  id: number;
  user_id: number;
}

interface AdminCreationAttributes extends Optional<AdminAttributes, 'id'> {}

export class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public id!: number;
  public user_id!: number;
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'admin',
    timestamps: false,
  }
);
