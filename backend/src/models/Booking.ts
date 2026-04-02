import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface BookingAttributes {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  date: Date;
  time: string;
  address: string;
  status: BookingStatus;
  notes?: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'status' | 'totalPrice' | 'createdAt' | 'updatedAt'> {}

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: string;
  public clientId!: string;
  public providerId!: string;
  public serviceId!: string;
  public date!: Date;
  public time!: string;
  public address!: string;
  public status!: BookingStatus;
  public notes?: string;
  public totalPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
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
    tableName: 'bookings',
    timestamps: true,
  }
);
