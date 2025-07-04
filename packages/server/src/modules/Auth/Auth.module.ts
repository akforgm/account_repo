import { Module } from '@nestjs/common';
import { AuthController } from './Auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/Jwt.strategy';
import { AuthenticationApplication } from './AuthApplication.sevice';
import { AuthSendResetPasswordService } from './commands/AuthSendResetPassword.service';
import { AuthResetPasswordService } from './commands/AuthResetPassword.service';
import { AuthSignupConfirmResendService } from './commands/AuthSignupConfirmResend.service';
import { AuthSignupConfirmService } from './commands/AuthSignupConfirm.service';
import { AuthSignupService } from './commands/AuthSignup.service';
import { AuthSigninService } from './commands/AuthSignin.service';
import { PasswordReset } from './models/PasswordReset';
import { TenantDBManagerModule } from '../TenantDBManager/TenantDBManager.module';
import { AuthenticationMailMesssages } from './AuthMailMessages.esrvice';
import { LocalStrategy } from './strategies/Local.strategy';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthMailSubscriber } from './Subscribers/AuthMail.subscriber';
import { BullModule } from '@nestjs/bullmq';
import {
  SendResetPasswordMailQueue,
  SendSignupVerificationMailQueue,
} from './Auth.constants';
import { SendResetPasswordMailProcessor } from './processors/SendResetPasswordMail.processor';
import { SendSignupVerificationMailProcessor } from './processors/SendSignupVerificationMail.processor';
import { MailModule } from '../Mail/Mail.module';
import { ConfigService } from '@nestjs/config';
import { InjectSystemModel } from '../System/SystemModels/SystemModels.module';
import { GetAuthMetaService } from './queries/GetAuthMeta.service';
import { AuthedController } from './Authed.controller';
import { GetAuthenticatedAccount } from './queries/GetAuthedAccount.service';
import { TenancyModule } from '../Tenancy/Tenancy.module';
import { EnsureUserVerifiedGuard } from './guards/EnsureUserVerified.guard';

const models = [InjectSystemModel(PasswordReset)];

@Module({
  controllers: [AuthController, AuthedController],
  imports: [
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: '1d', algorithm: 'HS384' },
        verifyOptions: { algorithms: ['HS384'] },
      }),
    }),
    TenantDBManagerModule,
    TenancyModule,
    BullModule.registerQueue({ name: SendResetPasswordMailQueue }),
    BullModule.registerQueue({ name: SendSignupVerificationMailQueue }),
  ],
  exports: [...models],
  providers: [
    ...models,
    LocalStrategy,
    JwtStrategy,
    AuthenticationApplication,
    AuthSendResetPasswordService,
    AuthResetPasswordService,
    AuthSignupConfirmResendService,
    AuthSignupConfirmService,
    AuthSignupService,
    AuthSigninService,
    AuthenticationMailMesssages,
    SendResetPasswordMailProcessor,
    SendSignupVerificationMailProcessor,
    GetAuthMetaService,
    GetAuthenticatedAccount,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EnsureUserVerifiedGuard,
    },
    AuthMailSubscriber,
  ],
})
export class AuthModule {}
