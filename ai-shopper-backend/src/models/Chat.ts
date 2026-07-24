import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  userId: Types.ObjectId;
  sessionId: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "New conversation",
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model<IChat>("Chat", chatSchema);
