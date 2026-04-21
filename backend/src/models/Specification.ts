import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SpecificationAttributes {
  id: number;
  url?: string;
  description?: string;
  document_id: number;
}

interface SpecificationCreationAttributes extends Optional<SpecificationAttributes, 'id' | 'url' | 'description'> {}

export class Specification extends Model<SpecificationAttributes, SpecificationCreationAttributes> implements SpecificationAttributes {
  public id!: number;
  public url?: string;
  public description?: string;
  public document_id!: number;
}

Specification.init(
  {
    id: {
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
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'document',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'specification',
    timestamps: false,
  }
);
