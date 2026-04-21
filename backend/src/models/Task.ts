import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TaskAttributes {
  id: number;
  name?: string;
  start_time?: Date;
  end_time?: Date;
  duration?: string;
  status: string;
  client_id: number;
  service_provider_id: number;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'name' | 'start_time' | 'end_time' | 'duration' | 'status'> {}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public name?: string;
  public start_time?: Date;
  public end_time?: Date;
  public duration?: string;
  public status!: string;
  public client_id!: number;
  public service_provider_id!: number;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    start_time: {
      type: DataTypes.DATE,
    },
    end_time: {
      type: DataTypes.DATE,
    },
    duration: {
      type: DataTypes.STRING, // INTERVAL in Postgres
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'not_started',
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'client',
        key: 'id_client',
      },
    },
    service_provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_provider',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'task',
    timestamps: false,
  }
);
