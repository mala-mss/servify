import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FileAttributes {
  idF: number;
  url?: string;
  type?: string;
  idT: number;
}

interface FileCreationAttributes extends Optional<FileAttributes, 'idF' | 'url' | 'type'> {}

export class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public idF!: number;
  public url?: string;
  public type?: string;
  public idT!: number;
}

File.init(
  {
    idF: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'idf',
    },
    url: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    idT: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'idt',
      references: {
        model: 'task',
        key: 'idt',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'file',
    timestamps: false,
  }
);