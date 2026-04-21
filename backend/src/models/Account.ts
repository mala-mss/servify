import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AccountAttributes {
  email: string;
  password: string;
  status: string;
  nbr_warning: number;
  date_creation: Date;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'status' | 'nbr_warning' | 'date_creation'> {}

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public email!: string;
  public password!: string;
  public status!: string;
  public nbr_warning!: number;
  public date_creation!: Date;
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
    date_creation: {
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
