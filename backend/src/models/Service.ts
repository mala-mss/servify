import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServiceAttributes {
  id_S: number;
  id_C?: number;
  name: string;
  description?: string;
  base_price?: number;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id_S' | 'id_C' | 'description' | 'base_price'> {}

export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id_S!: number;
  public id_C?: number;
  public name!: string;
  public description?: string;
  public base_price?: number;
}

Service.init(
  {
    id_S: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_C: {
      type: DataTypes.INTEGER,
      references: {
        model: 'service_category',
        key: 'id_C',
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
