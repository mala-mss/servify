import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Conversation, Message, User, Client, ServiceProvider, Notification } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const role = req.user?.role;

  if (!userId) throw new AppError('Unauthorized', 401);

  let whereClause = {};
  if (role === 'client') {
    whereClause = { idu_cl: userId };
  } else if (role === 'provider') {
    whereClause = { idu_sp: userId };
  } else {
    whereClause = {
      [Op.or]: [{ idu_cl: userId }, { idu_sp: userId }]
    };
  }

  const conversations = await Conversation.findAll({
    where: whereClause,
    include: [
      {
        model: Client,
        as: 'client',
        include: [{ model: User, as: 'user', attributes: ['id', 'fname', 'lname', 'profile_picture'] }]
      },
      {
        model: ServiceProvider,
        as: 'provider',
        include: [{ model: User, as: 'user', attributes: ['id', 'fname', 'lname', 'profile_picture'] }]
      }
    ],
    order: [['last_message_at', 'DESC']]
  });

  res.json({ conversations });
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id: conversationId } = req.params;
  const userId = req.userId;

  if (!userId) throw new AppError('Unauthorized', 401);

  const conversation = await Conversation.findByPk(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);

  // Check if user is part of the conversation
  if (conversation.idu_cl !== userId && conversation.idu_sp !== userId && req.user?.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const { page = 1, limit = 30 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const messages = await Message.findAndCountAll({
    where: { conversation_id: conversationId },
    order: [['sent_at', 'DESC']],
    limit: Number(limit),
    offset: offset,
    include: [{ model: User, as: 'sender', attributes: ['id', 'fname', 'lname'] }]
  });

  res.json({
    messages: messages.rows.reverse(), // Reverse to show in chronological order
    total: messages.count,
    currentPage: Number(page),
    totalPages: Math.ceil(messages.count / Number(limit))
  });
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id: conversationId } = req.params;
  const { encrypted_content, iv } = req.body;
  const userId = req.userId;

  if (!userId) throw new AppError('Unauthorized', 401);

  const conversation = await Conversation.findByPk(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);

  // Check if user is part of the conversation
  if (conversation.idu_cl !== userId && conversation.idu_sp !== userId) {
    throw new AppError('Forbidden', 403);
  }

  const message = await Message.create({
    conversation_id: conversationId,
    sender_id: userId,
    encrypted_content,
    iv
  });

  await conversation.update({ last_message_at: new Date() });

  // Create notification for the recipient
  const recipientId = conversation.idu_cl === userId ? conversation.idu_sp : conversation.idu_cl;
  const senderName = `${req.user.fname} ${req.user.lname}`;

  await Notification.create({
    user_id: recipientId,
    title: `New message from ${senderName}`,
    description: 'You have a new encrypted message.',
    type: 'message',
    is_read: false
  });

  res.status(201).json({ message });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id: messageId } = req.params;
  const userId = req.userId;

  if (!userId) throw new AppError('Unauthorized', 401);

  const message = await Message.findByPk(messageId, {
    include: [{ model: Conversation, as: 'conversation' }]
  });

  if (!message) throw new AppError('Message not found', 404);

  const conversation = (message as any).conversation;
  const isPart = conversation.idu_cl === userId || conversation.idu_sp === userId;
  
  if (!isPart || message.sender_id === userId) {
    throw new AppError('Forbidden', 403);
  }

  await message.update({ is_read: true });

  res.json({ message: 'Marked as read' });
};

export const startConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { participantId } = req.body;
  const userId = req.userId;
  const role = req.user?.role;

  if (!userId) throw new AppError('Unauthorized', 401);

  let idu_cl, idu_sp;

  if (role === 'client') {
    idu_cl = userId;
    idu_sp = participantId;
  } else if (role === 'provider') {
    idu_sp = userId;
    idu_cl = participantId;
  } else {
    throw new AppError('Invalid role to start conversation', 400);
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    where: { idu_cl, idu_sp }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      idu_cl,
      idu_sp
    });
  }

  res.json({ conversation });
};
