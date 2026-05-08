import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PaymentAttributes {
  id_P: number;
  id_S?: number;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  created_at: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id_P' | 'id_S' | 'currency' | 'status' | 'payment_method' | 'created_at'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id_P!: number;
  public id_S?: number;
  public amount!: number;
  public currency!: string;
  public status!: string;
  public payment_method?: string;
  public readonly created_at!: Date;
}

Payment.init(
  {
    id_P: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_S: {
      type: DataTypes.INTEGER,
      references: {
        model: 'service',
        key: 'id_S',
      },
    },
    amount: {
      type: DataTypes.NUMERIC(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'DZD',
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'unpaid',
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'payment',
    timestamps: false,
  }
);
