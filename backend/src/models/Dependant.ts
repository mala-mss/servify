import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DependantAttributes {
  id_dep: number;
  name?: string;
  date_of_birth?: Date;
  relationship?: string;
  id_U_CL: number;
}

interface DependantCreationAttributes extends Optional<DependantAttributes, 'id_dep' | 'name' | 'date_of_birth' | 'relationship'> {}

export class Dependant extends Model<DependantAttributes, DependantCreationAttributes> implements DependantAttributes {
  public id_dep!: number;
  public name?: string;
  public date_of_birth?: Date;
  public relationship?: string;
  public id_U_CL!: number;
}

Dependant.init(
  {
    id_dep: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
    },
    relationship: {
      type: DataTypes.STRING(50),
    },
    id_U_CL: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'client',
        key: 'idU_cl',
      },
    },
  },
  {
    sequelize,
    tableName: 'dependant',
    timestamps: false,
  }
);
