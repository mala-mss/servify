import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SpecificationsMedicalStatAttributes {
  id_SPEC: number;
  type?: string;
  url?: string;
  description?: string;
  id_dep?: number;
}

interface SpecificationsMedicalStatCreationAttributes extends Optional<SpecificationsMedicalStatAttributes, 'id_SPEC' | 'type' | 'url' | 'description' | 'id_dep'> {}

export class SpecificationsMedicalStat extends Model<SpecificationsMedicalStatAttributes, SpecificationsMedicalStatCreationAttributes> implements SpecificationsMedicalStatAttributes {
  public id_SPEC!: number;
  public type?: string;
  public url?: string;
  public description?: string;
  public id_dep?: number;
}

SpecificationsMedicalStat.init(
  {
    id_SPEC: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id_SPEC',
    },
    type: {
      type: DataTypes.STRING(50),
      field: 'type',
    },
    url: {
      type: DataTypes.TEXT,
      field: 'url',
    },
    description: {
      type: DataTypes.TEXT,
      field: 'description',
    },
    id_dep: {
      type: DataTypes.INTEGER,
      field: 'id_dep',
      references: {
        model: 'dependant',
        key: 'id_dep',
      },
    },
  },
  {
    sequelize,
    tableName: 'specifications_medical_stat',
    timestamps: false,
  }
);
