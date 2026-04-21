import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FeedbackAttributes {
  id: number;
  overall_rating?: number;
  punctuality?: number;
  comment?: string;
  booking_id: number;
  client_id: number;
  created_at: Date;
}

interface FeedbackCreationAttributes extends Optional<FeedbackAttributes, 'id' | 'overall_rating' | 'punctuality' | 'comment' | 'created_at'> {}

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public id!: number;
  public overall_rating?: number;
  public punctuality?: number;
  public comment?: string;
  public booking_id!: number;
  public client_id!: number;
  public readonly created_at!: Date;
}

Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    overall_rating: {
      type: DataTypes.NUMERIC(3, 2),
    },
    punctuality: {
      type: DataTypes.NUMERIC(3, 2),
    },
    comment: {
      type: DataTypes.TEXT,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'booking',
        key: 'id_booking',
      },
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'client',
        key: 'id_client',
      },
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
