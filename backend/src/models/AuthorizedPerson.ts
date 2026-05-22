import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuthorizedPersonAttributes {
  idU_AP: number;
  name?: string;
  relationship?: string;
  idU_CL: number;
}

interface AuthorizedPersonCreationAttributes extends Optional<AuthorizedPersonAttributes, 'idU_AP' | 'name' | 'relationship'> {}

export class AuthorizedPerson extends Model<AuthorizedPersonAttributes, AuthorizedPersonCreationAttributes> implements AuthorizedPersonAttributes {
  public idU_AP!: number;
  public name?: string;
  public relationship?: string;
  public idU_CL!: number;
}

AuthorizedPerson.init(
  {
    idU_AP: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'idU_AP',
    },
    name: {
      type: DataTypes.STRING(100),
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
    tableName: 'authorized_person',
    timestamps: false,
  }
);

export default AuthorizedPerson;
