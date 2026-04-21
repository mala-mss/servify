import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ServiceProviderServiceAttributes {
  service_provider_id: number;
  service_id: number;
}

export class ServiceProviderService extends Model<ServiceProviderServiceAttributes> implements ServiceProviderServiceAttributes {
  public service_provider_id!: number;
  public service_id!: number;
}

ServiceProviderService.init(
  {
    service_provider_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'service_provider',
        key: 'id',
      },
    },
    service_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'service',
        key: 'id_service',
      },
    },
  },
  {
    sequelize,
    tableName: 'service_provider_service',
    timestamps: false,
  }
);
