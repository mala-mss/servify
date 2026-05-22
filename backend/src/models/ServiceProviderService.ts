import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ServiceProviderServiceAttributes {
  idU_SP: number;
  id_S: number;
}

export class ServiceProviderService extends Model<ServiceProviderServiceAttributes> implements ServiceProviderServiceAttributes {
  public idU_SP!: number;
  public id_S!: number;
}

ServiceProviderService.init(
  {
    idU_SP: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'idU_SP',
      references: {
        model: 'service_provider',
        key: 'idU_SP',
      },
    },
    id_S: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'id_S',
      references: {
        model: 'service',
        key: 'id_S',
      },
    },
  },
  {
    sequelize,
    tableName: 'providing',
    timestamps: false,
  }
);
