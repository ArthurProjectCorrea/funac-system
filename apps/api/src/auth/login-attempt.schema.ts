import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoginAttemptDocument = LoginAttempt & Document;

@Schema()
export class LoginAttempt {
  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  success!: boolean;

  @Prop({ default: Date.now })
  timestamp!: Date;

  @Prop()
  ip?: string;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
