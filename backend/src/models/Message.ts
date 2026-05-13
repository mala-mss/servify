import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageAttributes {
  id: string;
  conversation_id: string;
  sender_id: number;
  encrypted_content: string;
  iv: string;
  sent_at: Date;
  is_read: boolean;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'sent_at' | 'is_read'> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public conversation_id!: string;
  public sender_id!: number;
  public encrypted_content!: string;
  public iv!: string;
  public readonly sent_at!: Date;
  public is_read!: boolean;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'conversation',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    encrypted_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iv: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'message',
    timestamps: false,
    indexes: [
      {
        fields: ['conversation_id', 'sent_at'],
      },
    ],
  }
);
