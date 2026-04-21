import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DocumentAttributes {
  id: number;
  name?: string;
  link?: string;
  type?: string;
  width?: number;
  service_provider_id: number;
  client_id?: number;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'name' | 'link' | 'type' | 'width' | 'client_id'> {}

export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: number;
  public name?: string;
  public link?: string;
  public type?: string;
  public width?: number;
  public service_provider_id!: number;
  public client_id?: number;
}

Document.init(
  {
    id: {
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
    service_provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_provider',
        key: 'id',
      },
    },
    client_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'client',
        key: 'id_client',
      },
    },
  },
  {
    sequelize,
    tableName: 'document',
    timestamps: false,
  }
);
