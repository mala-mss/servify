import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InscriptionRequestAttributes {
  id: number;
  status: string;
  submitted_at: Date;
  service_provider_id: number;
}

interface InscriptionRequestCreationAttributes extends Optional<InscriptionRequestAttributes, 'id' | 'status' | 'submitted_at'> {}

export class InscriptionRequest extends Model<InscriptionRequestAttributes, InscriptionRequestCreationAttributes> implements InscriptionRequestAttributes {
  public id!: number;
  public status!: string;
  public submitted_at!: Date;
  public service_provider_id!: number;
}

InscriptionRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    service_provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_provider',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'inscription_request',
    timestamps: false,
  }
);
