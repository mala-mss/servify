import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SpecificationAttributes {
  id_SPEC: number;
  url?: string;
  description?: string;
  id_DOC: number;
}

interface SpecificationCreationAttributes extends Optional<SpecificationAttributes, 'id_SPEC' | 'url' | 'description'> {}

export class Specification extends Model<SpecificationAttributes, SpecificationCreationAttributes> implements SpecificationAttributes {
  public id_SPEC!: number;
  public url?: string;
  public description?: string;
  public id_DOC!: number;
}

Specification.init(
  {
    id_SPEC: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    id_DOC: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'document',
        key: 'id_DOC',
      },
    },
  },
  {
    sequelize,
    tableName: 'specifications',
    timestamps: false,
  }
);
