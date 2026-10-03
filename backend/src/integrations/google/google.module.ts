// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleController } from './google.controller';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'google' })],
  controllers: [GoogleController],
  providers: [GoogleStrategy],
})
export class GoogleModule {}