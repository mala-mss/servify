import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PaymentAttributes {
  id_P: number;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  created_at: Date;
  idU_CL?: number;
  idU_SP?: number;
  date?: string;
  time?: string;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id_P' | 'currency' | 'status' | 'payment_method' | 'created_at' | 'idU_CL' | 'idU_SP' | 'date' | 'time'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id_P!: number;
  public amount!: number;
  public currency!: string;
  public status!: string;
  public payment_method?: string;
  public readonly created_at!: Date;
  public idU_CL?: number;
  public idU_SP?: number;
  public date?: string;
  public time?: string;
}

Payment.init(
  {
    id_P: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id_P',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
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
    idU_CL: {
      type: DataTypes.INTEGER,
      field: 'idU_CL',
    },
    idU_SP: {
      type: DataTypes.INTEGER,
      field: 'idU_SP',
    },
    date: {
      type: DataTypes.DATEONLY,
      field: 'date',
    },
    time: {
      type: DataTypes.TIME,
      field: 'time',
    },
  },
  {
    sequelize,
    tableName: 'payment',
    timestamps: false,
  }
);
