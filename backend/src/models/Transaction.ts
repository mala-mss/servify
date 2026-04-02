import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type TransactionType = 'payment' | 'payout' | 'refund';

interface TransactionAttributes {
  id: string;
  userId: string;
  jobId?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  paymentMethod?: string;
  transactionId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'jobId' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: string;
  public userId!: string;
  public jobId?: string;
  public type!: TransactionType;
  public amount!: number;
  public status!: TransactionStatus;
  public paymentMethod?: string;
  public transactionId?: string;
  public description?: string;
  public metadata?: Record<string, unknown>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    jobId: {
      type: DataTypes.UUID,
      references: {
        model: 'jobs',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('payment', 'payout', 'refund'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    metadata: {
      type: DataTypes.JSONB,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
  }
);
