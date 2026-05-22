import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DependantAttributes {
  id_dep: number;
  name?: string;
  date_of_birth?: Date;
  relationship?: string;
  idU_CL: number;
}

interface DependantCreationAttributes extends Optional<DependantAttributes, 'id_dep' | 'name' | 'date_of_birth' | 'relationship'> {}

export class Dependant extends Model<DependantAttributes, DependantCreationAttributes> implements DependantAttributes {
  public id_dep!: number;
  public name?: string;
  public date_of_birth?: Date;
  public relationship?: string;
  public idU_CL!: number;
}

Dependant.init(
  {
    id_dep: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id_dep',
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
    idU_CL: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'idU_CL',
      references: {
        model: 'client',
        key: 'idU_CL',
      },
    },
  },
  {
    sequelize,
    tableName: 'dependant',
    timestamps: false,
  }
);

export default Dependant;
