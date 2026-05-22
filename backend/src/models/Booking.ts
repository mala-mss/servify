import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface BookingAttributes {
  idU_CL: number;
  idU_SP: number;
  date: string;
  time: string;
  address?: string;
  status: string;
  id_S?: number;
}

export class Booking extends Model<BookingAttributes> implements BookingAttributes {
  public idU_CL!: number;
  public idU_SP!: number;
  public date!: string;
  public time!: string;
  public address?: string;
  public status!: string;
  public id_S?: number;
}

Booking.init(
  {
    idU_CL: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'idU_CL',
      references: {
        model: 'client',
        key: 'idU_CL',
      },
    },
    idU_SP: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'idU_SP',
      references: {
        model: 'service_provider',
        key: 'idU_SP',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      primaryKey: true,
      allowNull: false,
      field: 'date',
    },
    time: {
      type: DataTypes.TIME,
      primaryKey: true,
      allowNull: false,
      field: 'time',
    },
    address: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'confirmed',
    },
    id_S: {
      type: DataTypes.INTEGER,
      field: 'id_S',
      references: {
        model: 'service',
        key: 'id_S',
      },
    },
  },
  {
    sequelize,
    tableName: 'booking',
    timestamps: false,
  }
);
