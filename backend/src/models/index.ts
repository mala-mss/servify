import sequelize from '../config/database';
import { Account } from './Account';
import { User } from './User';
import { Admin } from './Admin';
import { Client } from './Client';
import { ServiceProvider } from './ServiceProvider';
import { InscriptionRequest } from './InscriptionRequest';
import { AuthorizedPerson } from './AuthorizedPerson';
import { Dependant } from './Dependant';
import { MedicalInfo } from './MedicalInfo';
import { DependantFile } from './DependantFile';
import { ServiceCategory } from './ServiceCategory';
import { Service } from './Service';
import { ServiceProviderService } from './ServiceProviderService';
import { Document } from './Document';
import { Specification } from './Specification';
import { BookingRequest } from './BookingRequest';
import { Booking } from './Booking';
import { Payment } from './Payment';
import { Task } from './Task';
import { File } from './File';
import { Report } from './Report';
import { Feedback } from './Feedback';
import { Notification } from './Notification';
import { Conversation } from './Conversation';
import { Message } from './Message';
import { UserPublicKey } from './UserPublicKey';

// Account & User
Account.hasOne(User, { foreignKey: 'email', sourceKey: 'email', as: 'user' });
User.belongsTo(Account, { foreignKey: 'email', targetKey: 'email', as: 'account' });

// User Public Key
User.hasOne(UserPublicKey, { foreignKey: 'user_id', as: 'publicKey' });
UserPublicKey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Role Associations
User.hasOne(Admin, { foreignKey: 'idU_A', as: 'admin' });
Admin.belongsTo(User, { foreignKey: 'idU_A', as: 'user' });

User.hasOne(Client, { foreignKey: 'idu_cl', as: 'client' });
Client.belongsTo(User, { foreignKey: 'idu_cl', as: 'user' });

User.hasOne(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });
ServiceProvider.belongsTo(User, { foreignKey: 'idu_sp', as: 'user' });

// Inscription Request
ServiceProvider.hasMany(InscriptionRequest, { foreignKey: 'idu_sp', as: 'inscriptionRequests' });
InscriptionRequest.belongsTo(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });

// Authorized Person
Client.hasMany(AuthorizedPerson, { foreignKey: 'idu_cl', as: 'authorizedPersons' });
AuthorizedPerson.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

// Dependant & Medical Info
Client.hasMany(Dependant, { foreignKey: 'idu_cl', as: 'dependants' });
Dependant.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

Dependant.hasOne(MedicalInfo, { foreignKey: 'id_dep', as: 'medicalInfo' });
MedicalInfo.belongsTo(Dependant, { foreignKey: 'id_dep', as: 'dependant' });

Dependant.hasMany(DependantFile, { foreignKey: 'id_dep', as: 'files' });
DependantFile.belongsTo(Dependant, { foreignKey: 'id_dep', as: 'dependant' });

// Service & Category
ServiceCategory.hasMany(Service, { foreignKey: 'id_c', as: 'services' });
Service.belongsTo(ServiceCategory, { foreignKey: 'id_c', as: 'category' });

// Service Provider & Service (Junction)
ServiceProvider.belongsToMany(Service, { 
  through: ServiceProviderService,
  foreignKey: 'idu_sp',
  otherKey: 'id_s',
  as: 'services'
});
Service.belongsToMany(ServiceProvider, {
  through: ServiceProviderService,
  foreignKey: 'id_s',
  otherKey: 'idu_sp',
  as: 'providers'
});

// Provider Availability (Fields are now in ServiceProvider model, keeping association if model exists)
// ServiceProvider.hasMany(ProviderAvailability, { foreignKey: 'service_provider_id', as: 'availabilities' });

// Document & Specification
ServiceProvider.hasMany(Document, { foreignKey: 'idu_sp', as: 'providerDocuments' });
Document.belongsTo(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });

Client.hasMany(Document, { foreignKey: 'idu_cl', as: 'clientDocuments' });
Document.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

Document.hasMany(Specification, { foreignKey: 'id_doc', as: 'specifications' });
Specification.belongsTo(Document, { foreignKey: 'id_doc', as: 'document' });

// Booking Request
Client.hasMany(BookingRequest, { foreignKey: 'idu_cl', as: 'bookingRequests' });
BookingRequest.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

ServiceProvider.hasMany(BookingRequest, { foreignKey: 'idu_sp', as: 'providerBookingRequests' });
BookingRequest.belongsTo(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });

Service.hasMany(BookingRequest, { foreignKey: 'service_id', as: 'bookingRequests' });
BookingRequest.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Booking
Client.hasMany(Booking, { foreignKey: 'idu_cl', as: 'bookings' });
Booking.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

ServiceProvider.hasMany(Booking, { foreignKey: 'idu_sp', as: 'providerBookings' });
Booking.belongsTo(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });

// Payment
Service.hasMany(Payment, { foreignKey: 'id_s', as: 'payments' });
Payment.belongsTo(Service, { foreignKey: 'id_s', as: 'service' });

// Task & File
Client.hasMany(Task, { foreignKey: 'idu_cl', as: 'tasks' });
Task.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

ServiceProvider.hasMany(Task, { foreignKey: 'idu_sp', as: 'providerTasks' });
Task.belongsTo(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });

Task.hasMany(File, { foreignKey: 'idt', as: 'files' });
File.belongsTo(Task, { foreignKey: 'idt', as: 'task' });

// Report
Account.hasMany(Report, { foreignKey: 'id_reporter', as: 'sentReports' });
Account.hasMany(Report, { foreignKey: 'id_reported', as: 'receivedReports' });
Report.belongsTo(Account, { foreignKey: 'id_reporter', as: 'reporter' });
Report.belongsTo(Account, { foreignKey: 'id_reported', as: 'reported' });

// Feedback
Client.hasMany(Feedback, { foreignKey: 'idu_cl', as: 'feedbacks' });
Feedback.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

ServiceProvider.hasMany(Feedback, { foreignKey: 'idu_sp', as: 'providerFeedbacks' });
Feedback.belongsTo(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });

// Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Conversations
Client.hasMany(Conversation, { foreignKey: 'idu_cl', as: 'conversations' });
Conversation.belongsTo(Client, { foreignKey: 'idu_cl', as: 'client' });

ServiceProvider.hasMany(Conversation, { foreignKey: 'idu_sp', as: 'providerConversations' });
Conversation.belongsTo(ServiceProvider, { foreignKey: 'idu_sp', as: 'provider' });

// Messages
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

export {
  sequelize,
  Account,
  User,
  Admin,
  Client,
  ServiceProvider,
  InscriptionRequest,
  AuthorizedPerson,
  Dependant,
  MedicalInfo,
  DependantFile,
  ServiceCategory,
  Service,
  ServiceProviderService,
  Document,
  Specification,
  BookingRequest,
  Booking,
  Payment,
  Task,
  File,
  Report,
  Feedback,
  Notification,
  Conversation,
  Message,
  UserPublicKey,
};
