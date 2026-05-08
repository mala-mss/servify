import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DocumentAttributes {
  id_DOC: number;
  name?: string;
  link?: string;
  type?: string;
  width?: number;
  idU_SP?: number;
  idU_CL?: number;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id_DOC' | 'name' | 'link' | 'type' | 'width' | 'idU_SP' | 'idU_CL'> {}

export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id_DOC!: number;
  public name?: string;
  public link?: string;
  public type?: string;
  public width?: number;
  public idU_SP?: number;
  public idU_CL?: number;
}

Document.init(
  {
    id_DOC: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    link: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    width: {
      type: DataTypes.INTEGER,
    },
    idU_SP: {
      type: DataTypes.INTEGER,
      references: {
        model: 'service_provider',
        key: 'idU_SP',
      },
    },
    idU_CL: {
      type: DataTypes.INTEGER,
      references: {
        model: 'client',
        key: 'idU_cl',
      },
    },
  },
  {
    sequelize,
    tableName: 'document',
    timestamps: false,
  }
);
