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
  id_user?: number;
  status?: string;
  rejection_reason?: string;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id_DOC' | 'name' | 'link' | 'type' | 'width' | 'idU_SP' | 'idU_CL' | 'id_user' | 'status' | 'rejection_reason'> {}

export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id_DOC!: number;
  public name?: string;
  public link?: string;
  public type?: string;
  public width?: number;
  public idU_SP?: number;
  public idU_CL?: number;
  public id_user?: number;
  public status?: string;
  public rejection_reason?: string;
}

Document.init(
  {
    id_DOC: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id_doc',
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
      field: 'idu_sp',
      references: {
        model: 'service_provider',
        key: 'idu_sp',
      },
    },
    idU_CL: {
      type: DataTypes.INTEGER,
      field: 'idu_cl',
      references: {
        model: 'client',
        key: 'idu_cl',
      },
    },
    id_user: {
      type: DataTypes.INTEGER,
      field: 'id_user',
      references: {
        model: 'user',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'document',
    timestamps: false,
  }
);
