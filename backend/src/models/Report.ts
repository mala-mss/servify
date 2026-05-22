import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReportAttributes {
  email1: string;
  email2: string;
  reason?: string;
  description?: string;
  created_at: Date;
}

interface ReportCreationAttributes extends Optional<ReportAttributes, 'reason' | 'description' | 'created_at'> {}

export class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public email1!: string;
  public email2!: string;
  public reason?: string;
  public description?: string;
  public readonly created_at!: Date;
}

Report.init(
  {
    email1: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      field: 'email1',
      references: {
        model: 'account',
        key: 'email',
      },
    },
    email2: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      field: 'email2',
      references: {
        model: 'account',
        key: 'email',
      },
    },
    reason: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'report',
    timestamps: false,
  }
);
