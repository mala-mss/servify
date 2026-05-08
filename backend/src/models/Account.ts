import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AccountAttributes {
  email: string;
  password: string;
  status: string;
  nbr_warning: number;
  created_at: Date;
  updated_at: Date;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'status' | 'nbr_warning' | 'created_at' | 'updated_at'> {}

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public email!: string;
  public password!: string;
  public status!: string;
  public nbr_warning!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Account.init(
  {
    email: {
      type: DataTypes.STRING(100),
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
    },
    nbr_warning: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'account',
    timestamps: false,
  }
);
