import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BookingRequestAttributes {
  id: number;
  date: Date;
  time: string;
  duration?: string;
  status: string;
  client_id_fk: number;
  service_provider_id_fk: number;
  service_id?: number;
  document_id?: number;
}

interface BookingRequestCreationAttributes extends Optional<BookingRequestAttributes, 'id' | 'duration' | 'status' | 'service_id' | 'document_id'> {}

export class BookingRequest extends Model<BookingRequestAttributes, BookingRequestCreationAttributes> implements BookingRequestAttributes {
  public id!: number;
  public date!: Date;
  public time!: string;
  public duration?: string;
  public status!: string;
  public client_id_fk!: number;
  public service_provider_id_fk!: number;
  public service_id?: number;
  public document_id?: number;
}

BookingRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      type: DataTypes.STRING, // Sequelize doesn't have a native INTERVAL type for all DBs, often mapped to STRING or Custom
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    client_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'client',
        key: 'id_client',
      },
    },
    service_provider_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_provider',
        key: 'id',
      },
    },
    service_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'service',
        key: 'id_service',
      },
    },
    document_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'document',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'booking_request',
    timestamps: false,
  }
);
