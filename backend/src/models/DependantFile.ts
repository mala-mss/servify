import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DependantFileAttributes {
  id: number;
  link?: string;
  type?: string;
  dependant_id: number;
}

interface DependantFileCreationAttributes extends Optional<DependantFileAttributes, 'id' | 'link' | 'type'> {}

export class DependantFile extends Model<DependantFileAttributes, DependantFileCreationAttributes> implements DependantFileAttributes {
  public id!: number;
  public link?: string;
  public type?: string;
  public dependant_id!: number;
}

DependantFile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    link: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    dependant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dependant',
        key: 'id_dependant',
      },
    },
  },
  {
    sequelize,
    tableName: 'dependant_file',
    timestamps: false,
  }
);
