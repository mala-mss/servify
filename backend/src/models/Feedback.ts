import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FeedbackAttributes {
  email1: string;
  email2: string;
  overall_rating?: number;
  punctuality?: number;
  comment?: string;
  created_at?: Date;
}

interface FeedbackCreationAttributes extends Optional<FeedbackAttributes, 'overall_rating' | 'punctuality' | 'comment' | 'created_at'> {}

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public email1!: string;
  public email2!: string;
  public overall_rating?: number;
  public punctuality?: number;
  public comment?: string;
  public readonly created_at!: Date;
}

Feedback.init(
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
    overall_rating: {
      type: DataTypes.DECIMAL(3, 2),
      field: 'overall_rating',
    },
    punctuality: {
      type: DataTypes.DECIMAL(3, 2),
      field: 'punctuality',
    },
    comment: {
      type: DataTypes.TEXT,
      field: 'comment',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'feedback',
    timestamps: false,
  }
);
