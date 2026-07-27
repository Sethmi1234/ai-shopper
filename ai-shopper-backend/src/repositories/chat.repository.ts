import Chat from "../models/chat.model";

export class ChatRepository {
  async findByUserIdAndSessionId(userId: string, sessionId: string) {
    return Chat.findOne({ userId, sessionId });
  }

  async findRecentActiveByUserId(userId: string) {
    return Chat.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
  }

  async create(chatData: any) {
    return Chat.create(chatData);
  }

  async save(chatDocument: any) {
    return chatDocument.save();
  }

  async findByUserId(userId: string) {
    return Chat.find({ userId }).sort({ updatedAt: -1 });
  }

  async deleteByUserIdAndSessionId(userId: string, sessionId: string) {
    return Chat.findOneAndDelete({ userId, sessionId });
  }

  async deleteManyByUserId(userId: string) {
    return Chat.deleteMany({ userId });
  }
}
