import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InscriptionRequestAttributes {
  id_R: number;
  status: string;
  submitted_at: Date;
  id_U_SP: number;
}

interface InscriptionRequestCreationAttributes extends Optional<InscriptionRequestAttributes, 'id_R' | 'status' | 'submitted_at'> {}

export class InscriptionRequest extends Model<InscriptionRequestAttributes, InscriptionRequestCreationAttributes> implements InscriptionRequestAttributes {
  public id_R!: number;
  public status!: string;
  public submitted_at!: Date;
  public id_U_SP!: number;
}

InscriptionRequest.init(
  {
    id_R: {
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
    id_U_SP: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_provider',
        key: 'idU_SP',
      },
    },
  },
  {
    sequelize,
    tableName: 'inscription_request',
    timestamps: false,
  }
);
