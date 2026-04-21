import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServiceCategoryAttributes {
  id_category: number;
  name: string;
  target_demographics?: string;
  policies?: string;
  icon?: string;
}

interface ServiceCategoryCreationAttributes extends Optional<ServiceCategoryAttributes, 'id_category' | 'target_demographics' | 'policies' | 'icon'> {}

export class ServiceCategory extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes> implements ServiceCategoryAttributes {
  public id_category!: number;
  public name!: string;
  public target_demographics?: string;
  public policies?: string;
  public icon?: string;
}

ServiceCategory.init(
  {
    id_category: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_demographics: {
      type: DataTypes.TEXT,
    },
    policies: {
      type: DataTypes.TEXT,
    },
    icon: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'service_category',
    timestamps: false,
  }
);
