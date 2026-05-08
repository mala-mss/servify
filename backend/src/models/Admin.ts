import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AdminAttributes {
  idU_A: number;
}

interface AdminCreationAttributes extends AdminAttributes {}

export class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public idU_A!: number;
}

Admin.init(
  {
    idU_A: {
      type: DataTypes.INTEGER,
      primaryKey: true,
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

