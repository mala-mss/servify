import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NotificationAttributes {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  type?: string;
  is_read: boolean;
  created_at: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'description' | 'type' | 'is_read' | 'created_at'> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public user_id!: number;
  public title!: string;
  public description?: string;
  public type?: string;
  public is_read!: boolean;
  public readonly created_at!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING(20),
    },
    is_read: {
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
    tableName: 'notification',
    timestamps: false,
  }
);
