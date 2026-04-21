import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServiceProviderAttributes {
  id: number;
  bio?: string;
  years_of_exp: number;
  work_outside_city: boolean;
  work_late: boolean;
  rating: number;
  review_count: number;
  price_per_hour?: number;
  user_id: number;
}

interface ServiceProviderCreationAttributes extends Optional<ServiceProviderAttributes, 'id' | 'bio' | 'years_of_exp' | 'work_outside_city' | 'work_late' | 'rating' | 'review_count' | 'price_per_hour'> {}

export class ServiceProvider extends Model<ServiceProviderAttributes, ServiceProviderCreationAttributes> implements ServiceProviderAttributes {
  public id!: number;
  public bio?: string;
  public years_of_exp!: number;
  public work_outside_city!: boolean;
  public work_late!: boolean;
  public rating!: number;
  public review_count!: number;
  public price_per_hour?: number;
  public user_id!: number;
}

ServiceProvider.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    years_of_exp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    work_outside_city: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    work_late: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    price_per_hour: {
      type: DataTypes.DECIMAL(10, 2),
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
    tableName: 'service_provider',
    timestamps: false,
  }
);
