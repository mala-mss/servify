import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InscriptionRequestAttributes {
  id_R: number;
  status: string;
  submitted_at: Date;
  idU_A?: number;
}

interface InscriptionRequestCreationAttributes extends Optional<InscriptionRequestAttributes, 'id_R' | 'status' | 'submitted_at'> {}

export class InscriptionRequest extends Model<InscriptionRequestAttributes, InscriptionRequestCreationAttributes> implements InscriptionRequestAttributes {
  public id_R!: number;
  public status!: string;
  public submitted_at!: Date;
  public idU_A?: number;
}

InscriptionRequest.init(
  {
    id_R: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id_R',
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    idU_A: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'idU_A',
      references: {
        model: 'admin',
        key: 'idU_A',
      },
    },
  },
  {
    sequelize,
    tableName: 'inscription_request',
    timestamps: false,
  }
);

export default InscriptionRequest;
