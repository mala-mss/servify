import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  fname: string;
  lname: string;
  address?: string;
  phone_number?: string;
  profile_picture?: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'address' | 'phone_number' | 'profile_picture' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public fname!: string;
  public lname!: string;
  public address?: string;
  public phone_number?: string;
  public profile_picture?: string;
  public email!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: false,
  }
);
