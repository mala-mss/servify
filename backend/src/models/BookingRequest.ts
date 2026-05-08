import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BookingRequestAttributes {
  id_R: number;
  idU_cl: number;
  idU_SP: number;
  date: Date;
  time: string;
  duration?: string;
  status: string;
  service_id?: number;
}

interface BookingRequestCreationAttributes extends Optional<BookingRequestAttributes, 'id_R' | 'duration' | 'status' | 'service_id'> {}

export class BookingRequest extends Model<BookingRequestAttributes, BookingRequestCreationAttributes> implements BookingRequestAttributes {
  public id_R!: number;
  public idU_cl!: number;
  public idU_SP!: number;
  public date!: Date;
  public time!: string;
  public duration?: string;
  public status!: string;
  public service_id?: number;
}

BookingRequest.init(
  {
    id_R: {
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
    duration: {
      type: DataTypes.STRING, 
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    service_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'service',
        key: 'id_S',
      },
    },
  },
  {
    sequelize,
    tableName: 'booking_request',
    timestamps: false,
  }
);
