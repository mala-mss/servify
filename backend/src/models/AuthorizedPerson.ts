import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuthorizedPersonAttributes {
  id: number;
  name?: string;
  phone_number?: string;
  national_id?: string;
  client_id: number;
}

interface AuthorizedPersonCreationAttributes extends Optional<AuthorizedPersonAttributes, 'id' | 'name' | 'phone_number' | 'national_id'> {}

export class AuthorizedPerson extends Model<AuthorizedPersonAttributes, AuthorizedPersonCreationAttributes> implements AuthorizedPersonAttributes {
  public id!: number;
  public name?: string;
  public phone_number?: string;
  public national_id?: string;
  public client_id!: number;
}

AuthorizedPerson.init(
  {
    id: {
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
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'client',
        key: 'id_client',
      },
    },
  },
  {
    sequelize,
    tableName: 'authorized_person',
    timestamps: false,
  }
);
