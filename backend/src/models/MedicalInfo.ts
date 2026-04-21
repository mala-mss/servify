import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MedicalInfoAttributes {
  id: number;
  blood_type?: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
  dependent_id: number;
}

interface MedicalInfoCreationAttributes extends Optional<MedicalInfoAttributes, 'id' | 'blood_type' | 'allergies' | 'medications' | 'conditions'> {}

export class MedicalInfo extends Model<MedicalInfoAttributes, MedicalInfoCreationAttributes> implements MedicalInfoAttributes {
  public id!: number;
  public blood_type?: string;
  public allergies?: string;
  public medications?: string;
  public conditions?: string;
  public dependent_id!: number;
}

MedicalInfo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    blood_type: {
      type: DataTypes.STRING(10),
    },
    allergies: {
      type: DataTypes.TEXT,
    },
    medications: {
      type: DataTypes.TEXT,
    },
    conditions: {
      type: DataTypes.TEXT,
    },
    dependent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dependant',
        key: 'id_dependant',
      },
    },
  },
  {
    sequelize,
    tableName: 'medical_info',
    timestamps: false,
  }
);
