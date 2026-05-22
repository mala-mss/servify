import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DocumentRequestAttributes {
  id_DOC: number;
  name?: string;
  link?: string;
  type?: string;
  description?: string;
  idU_CL?: number;
  idU_SP?: number;
  date?: string;
}

interface DocumentRequestCreationAttributes extends Optional<DocumentRequestAttributes, 'id_DOC' | 'name' | 'link' | 'type' | 'description' | 'idU_CL' | 'idU_SP' | 'date'> {}

export class DocumentRequest extends Model<DocumentRequestAttributes, DocumentRequestCreationAttributes> implements DocumentRequestAttributes {
  public id_DOC!: number;
  public name?: string;
  public link?: string;
  public type?: string;
  public description?: string;
  public idU_CL?: number;
  public idU_SP?: number;
  public date?: string;
}

DocumentRequest.init(
  {
    id_DOC: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id_DOC',
    },
    name: {
      type: DataTypes.STRING(100),
      field: 'name',
    },
    link: {
      type: DataTypes.TEXT,
      field: 'link',
    },
    type: {
      type: DataTypes.STRING(50),
      field: 'type',
    },
    description: {
      type: DataTypes.TEXT,
      field: 'description',
    },
    idU_CL: {
      type: DataTypes.INTEGER,
      field: 'idU_CL',
      references: {
        model: 'client',
        key: 'idU_CL',
      },
    },
    idU_SP: {
      type: DataTypes.INTEGER,
      field: 'idU_SP',
      references: {
        model: 'service_provider',
        key: 'idU_SP',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      field: 'date',
    },
  },
  {
    sequelize,
    tableName: 'document_request',
    timestamps: false,
  }
);
