import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServiceProviderAttributes {
  idU_SP: number;
  bio?: string;
  years_of_exp: number;
  work_outside_city: boolean;
  work_late: boolean;
  rating: number;
  review_count: number;
  price_per_hour?: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
}

interface ServiceProviderCreationAttributes extends Optional<ServiceProviderAttributes, 'bio' | 'years_of_exp' | 'work_outside_city' | 'work_late' | 'rating' | 'review_count' | 'price_per_hour' | 'day_of_week' | 'start_time' | 'end_time'> {}

export class ServiceProvider extends Model<ServiceProviderAttributes, ServiceProviderCreationAttributes> implements ServiceProviderAttributes {
  public idU_SP!: number;
  public bio?: string;
  public years_of_exp!: number;
  public work_outside_city!: boolean;
  public work_late!: boolean;
  public rating!: number;
  public review_count!: number;
  public price_per_hour?: number;
  public day_of_week?: string;
  public start_time?: string;
  public end_time?: string;
}

ServiceProvider.init(
  {
    idU_SP: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id',
      },
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
    day_of_week: {
      type: DataTypes.STRING(10),
    },
    start_time: {
      type: DataTypes.TIME,
    },
    end_time: {
      type: DataTypes.TIME,
    },
  },
  {
    sequelize,
    tableName: 'service_provider',
    timestamps: false,
  }
);
