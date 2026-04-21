import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FileAttributes {
  id: number;
  url?: string;
  type?: string;
  task_id: number;
}

interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'url' | 'type'> {}

export class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: number;
  public url?: string;
  public type?: string;
  public task_id!: number;
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'task',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'file',
    timestamps: false,
  }
);
