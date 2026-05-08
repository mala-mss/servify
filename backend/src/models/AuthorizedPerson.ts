import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuthorizedPersonAttributes {
  id_AP: number;
  name?: string;
  phone_number?: string;
  national_id?: string;
  id_U_CL: number;
}

interface AuthorizedPersonCreationAttributes extends Optional<AuthorizedPersonAttributes, 'id_AP' | 'name' | 'phone_number' | 'national_id'> {}

export class AuthorizedPerson extends Model<AuthorizedPersonAttributes, AuthorizedPersonCreationAttributes> implements AuthorizedPersonAttributes {
  public id_AP!: number;
  public name?: string;
  public phone_number?: string;
  public national_id?: string;
  public id_U_CL!: number;
}

AuthorizedPerson.init(
  {
    id_AP: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    national_id: {
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
    tableName: 'authorized_person',
    timestamps: false,
  }
);
