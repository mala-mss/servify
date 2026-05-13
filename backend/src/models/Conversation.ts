import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ConversationAttributes {
  id: string;
  idu_cl: number;
  idu_sp: number;
  created_at: Date;
  last_message_at: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'created_at' | 'last_message_at'> {}

export class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public idu_cl!: number;
  public idu_sp!: number;
  public readonly created_at!: Date;
  public last_message_at!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    idu_cl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'client',
        key: 'idu_cl',
      },
    },
    idu_sp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_provider',
        key: 'idu_sp',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'conversation',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['idu_cl', 'idu_sp'],
      },
    ],
  }
);
