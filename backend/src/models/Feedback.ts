import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FeedbackAttributes {
  idU_cl: number;
  idU_SP: number;
  overall_rating?: number;
  punctuality?: number;
  title?: string;
  comment?: string;
  is_verified_booking?: boolean;
  created_at: Date;
}

interface FeedbackCreationAttributes extends Optional<FeedbackAttributes, 'overall_rating' | 'punctuality' | 'title' | 'comment' | 'is_verified_booking' | 'created_at'> {}

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public idU_cl!: number;
  public idU_SP!: number;
  public overall_rating?: number;
  public punctuality?: number;
  public title?: string;
  public comment?: string;
  public is_verified_booking?: boolean;
  public readonly created_at!: Date;
}

Feedback.init(
  {
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
    overall_rating: {
      type: DataTypes.DECIMAL(3, 2),
    },
    punctuality: {
      type: DataTypes.DECIMAL(3, 2),
    },
    title: {
      type: DataTypes.STRING(100),
    },
    comment: {
      type: DataTypes.TEXT,
    },
    is_verified_booking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'feedback',
    timestamps: false,
  }
);
