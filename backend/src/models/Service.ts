import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServiceAttributes {
  id_service: number;
  category_id_fk?: number;
  name: string;
  description?: string;
  base_price?: number;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id_service' | 'category_id_fk' | 'description' | 'base_price'> {}

export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id_service!: number;
  public category_id_fk?: number;
  public name!: string;
  public description?: string;
  public base_price?: number;
}

Service.init(
  {
    id_service: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id_fk: {
      type: DataTypes.INTEGER,
      references: {
        model: 'service_category',
        key: 'id_category',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    base_price: {
      type: DataTypes.NUMERIC(10, 2),
    },
  },
  {
    sequelize,
    tableName: 'service',
    timestamps: false,
  }
);
