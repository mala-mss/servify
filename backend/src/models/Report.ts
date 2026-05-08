import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReportAttributes {
  id_reporter: string;
  id_reported: string;
  reason?: string;
  description?: string;
  created_at: Date;
}

interface ReportCreationAttributes extends Optional<ReportAttributes, 'reason' | 'description' | 'created_at'> {}

export class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public id_reporter!: string;
  public id_reported!: string;
  public reason?: string;
  public description?: string;
  public readonly created_at!: Date;
}

Report.init(
  {
    id_reporter: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      references: {
        model: 'account',
        key: 'email',
      },
    },
    id_reported: {
      type: DataTypes.STRING(100),
      primaryKey: true,
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
