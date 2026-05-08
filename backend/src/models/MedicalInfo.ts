import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MedicalInfoAttributes {
  id_dep: number;
  blood_type?: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
}

interface MedicalInfoCreationAttributes extends Optional<MedicalInfoAttributes, 'blood_type' | 'allergies' | 'medications' | 'conditions'> {}

export class MedicalInfo extends Model<MedicalInfoAttributes, MedicalInfoCreationAttributes> implements MedicalInfoAttributes {
  public id_dep!: number;
  public blood_type?: string;
  public allergies?: string;
  public medications?: string;
  public conditions?: string;
}

MedicalInfo.init(
  {
    id_dep: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'dependant',
        key: 'id_dep',
      },
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
  },
  {
    sequelize,
    tableName: 'medical_info',
    timestamps: false,
  }
);
