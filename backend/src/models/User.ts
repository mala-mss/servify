import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  IdU: number;
  fname: string;
  lname: string;
  address?: string;
  phone_number?: string;
  profile_picture?: string;
  email: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'IdU' | 'address' | 'phone_number' | 'profile_picture'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public IdU!: number;
  public fname!: string;
  public lname!: string;
  public address?: string;
  public phone_number?: string;
  public profile_picture?: string;
  public email!: string;
}

User.init(
  {
    IdU: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'IdU',
    },
    fname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    profile_picture: {
      type: DataTypes.TEXT,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      references: {
        model: 'account',
        key: 'email',
      },
    },
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: false,
  }
);

export default User;
