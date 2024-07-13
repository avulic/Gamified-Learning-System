// Reply
export interface IReply extends Document {
    content: string;
    author: IUser['_id'];
    discussion: IDiscussion['_id'];
    createdAt: Date;
  }
  
  const ReplySchema: Schema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    discussion: { type: Schema.Types.ObjectId, ref: 'Discussion', required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  export const Reply = mongoose.model<IReply>('Reply', ReplySchema);
  
