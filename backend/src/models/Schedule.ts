import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ScheduleAttributes {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  title?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduleCreationAttributes extends Optional<ScheduleAttributes, 'id' | 'isAvailable' | 'title' | 'color' | 'createdAt' | 'updatedAt'> {}

export class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  public id!: string;
  public providerId!: string;
  public dayOfWeek!: number;
  public startTime!: string;
  public endTime!: string;
  public isAvailable!: boolean;
  public title?: string;
  public color?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Schedule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
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
    tableName: 'schedules',
    timestamps: true,
  }
);
