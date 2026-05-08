import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DependantFileAttributes {
  id_dep: number;
  link?: string;
  type?: string;
}

interface DependantFileCreationAttributes extends Optional<DependantFileAttributes, 'link' | 'type'> {}

export class DependantFile extends Model<DependantFileAttributes, DependantFileCreationAttributes> implements DependantFileAttributes {
  public id_dep!: number;
  public link?: string;
  public type?: string;
}

DependantFile.init(
  {
    id_dep: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'dependant',
        key: 'id_dep',
      },
    },
    link: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    tableName: 'dependant_file',
    timestamps: false,
  }
);
