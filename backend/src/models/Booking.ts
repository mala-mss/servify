import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BookingAttributes {
  id_B: number;
  idU_cl: number;
  idU_SP: number;
  date: Date;
  time: string;
  address?: string;
  status: string;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id_B' | 'address' | 'status'> {}

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id_B!: number;
  public idU_cl!: number;
  public idU_SP!: number;
  public date!: Date;
  public time!: string;
  public address?: string;
  public status!: string;
}

Booking.init(
  {
    id_B: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idU_cl: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'client',
        key: 'idU_cl',
      },
    },
    idU_SP: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'service_provider',
        key: 'idU_SP',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'confirmed',
    },
  },
  {
    sequelize,
    tableName: 'booking',
    timestamps: false,
  }
);
