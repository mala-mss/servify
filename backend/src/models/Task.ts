import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TaskAttributes {
  idT: number;
  idU_cl: number;
  idU_SP: number;
  name?: string;
  start_time?: Date;
  end_time?: Date;
  duration?: string;
  status: string;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'idT' | 'name' | 'start_time' | 'end_time' | 'duration' | 'status'> {}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public idT!: number;
  public idU_cl!: number;
  public idU_SP!: number;
  public name?: string;
  public start_time?: Date;
  public end_time?: Date;
  public duration?: string;
  public status!: string;
}

Task.init(
  {
    idT: {
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
  },
  {
    sequelize,
    tableName: 'task',
    timestamps: false,
  }
);
