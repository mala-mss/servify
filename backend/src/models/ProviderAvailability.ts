import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProviderAvailabilityAttributes {
  id: number;
  service_provider_id: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
}

interface ProviderAvailabilityCreationAttributes extends Optional<ProviderAvailabilityAttributes, 'id' | 'day_of_week' | 'start_time' | 'end_time'> {}

export class ProviderAvailability extends Model<ProviderAvailabilityAttributes, ProviderAvailabilityCreationAttributes> implements ProviderAvailabilityAttributes {
  public id!: number;
  public service_provider_id!: number;
  public day_of_week?: string;
  public start_time?: string;
  public end_time?: string;
}

ProviderAvailability.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    service_provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_provider',
        key: 'id',
      },
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
    tableName: 'provider_availability',
    timestamps: false,
  }
);
