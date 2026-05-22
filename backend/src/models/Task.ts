import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TaskAttributes {
  idT: number;
  name?: string;
  start_time?: Date;
  end_time?: Date;
  duration?: string;
  status: string;
  idU_CL?: number;
  idU_SP?: number;
  date?: string;
  time?: string;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'idT' | 'name' | 'start_time' | 'end_time' | 'duration' | 'status' | 'idU_CL' | 'idU_SP' | 'date' | 'time'> {}

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public idT!: number;
  public name?: string;
  public start_time?: Date;
  public end_time?: Date;
  public duration?: string;
  public status!: string;
  public idU_CL?: number;
  public idU_SP?: number;
  public date?: string;
  public time?: string;
}

Task.init(
  {
    idT: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'idT',
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
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'not_started',
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
    tableName: 'task',
    timestamps: false,
  }
);
