import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DocCvAttributes {
  id: number;
  type?: string;
  link?: string;
  id_R?: number;
  idU_SP?: number;
}

interface DocCvCreationAttributes extends Optional<DocCvAttributes, 'id' | 'type' | 'link' | 'id_R' | 'idU_SP'> {}

export class DocCv extends Model<DocCvAttributes, DocCvCreationAttributes> implements DocCvAttributes {
  public id!: number;
  public type?: string;
  public link?: string;
  public id_R?: number;
  public idU_SP?: number;
}

DocCv.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    type: {
      type: DataTypes.STRING(50),
      field: 'type',
    },
    link: {
      type: DataTypes.TEXT,
      field: 'link',
    },
    id_R: {
      type: DataTypes.INTEGER,
      field: 'id_R',
      references: {
        model: 'inscription_request',
        key: 'id_R',
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
  },
  {
    sequelize,
    tableName: 'doc_cv',
    timestamps: false,
  }
);
