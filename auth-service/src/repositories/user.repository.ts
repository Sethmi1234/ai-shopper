import User from "../models/user.model";

export class UserRepository {
  async findByEmail(email: string) {
    return User.findOne({ email });
  }

  async findById(id: string) {
    return User.findById(id);
  }

  async create(userData: any) {
    return User.create(userData);
  }

  async save(userDocument: any) {
    return userDocument.save();
  }
}
