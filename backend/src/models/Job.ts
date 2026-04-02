import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

type JobStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'declined' | 'cancelled';

interface JobAttributes {
  id: string;
  bookingId?: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: string;
  status: JobStatus;
  notes?: string;
  providerNotes?: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'bookingId' | 'status' | 'totalPrice' | 'createdAt' | 'updatedAt'> {}

export class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: string;
  public bookingId?: string;
  public clientId!: string;
  public providerId!: string;
  public serviceId!: string;
  public title!: string;
  public date!: Date;
  public startTime!: string;
  public endTime!: string;
  public address!: string;
  public status!: JobStatus;
  public notes?: string;
  public providerNotes?: string;
  public totalPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.UUID,
      references: {
        model: 'bookings',
        key: 'id',
      },
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'declined', 'cancelled'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
    },
    providerNotes: {
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
    tableName: 'jobs',
    timestamps: true,
  }
);
