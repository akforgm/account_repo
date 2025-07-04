import { Injectable } from '@nestjs/common';
import { AuthSigninService } from './commands/AuthSignin.service';
import { AuthSignupService } from './commands/AuthSignup.service';
import { AuthSignupConfirmService } from './commands/AuthSignupConfirm.service';
import { AuthSignupConfirmResendService } from './commands/AuthSignupConfirmResend.service';
import { AuthSigninDto } from './dtos/AuthSignin.dto';
import { AuthSignupDto } from './dtos/AuthSignup.dto';
import { AuthSendResetPasswordService } from './commands/AuthSendResetPassword.service';
import { AuthResetPasswordService } from './commands/AuthResetPassword.service';
import { GetAuthMetaService } from './queries/GetAuthMeta.service';
import { GetAuthenticatedAccount } from './queries/GetAuthedAccount.service';

@Injectable()
export class AuthenticationApplication {
  constructor(
    private readonly authSigninService: AuthSigninService,
    private readonly authSignupService: AuthSignupService,
    private readonly authSignupConfirmService: AuthSignupConfirmService,
    private readonly authSignUpConfirmResendService: AuthSignupConfirmResendService,
    private readonly authResetPasswordService: AuthResetPasswordService,
    private readonly authSendResetPasswordService: AuthSendResetPasswordService,
    private readonly authGetMeta: GetAuthMetaService,
    private readonly getAuthedAccountService: GetAuthenticatedAccount,
  ) {}

  /**
   * Signin and generates JWT token.
   * @param {string} email - Email address.
   * @param {string} password - Password.
   */
  public async signIn(email: string, password: string) {
    return this.authSigninService.signin(email, password);
  }

  /**
   * Signup a new user.
   * @param {IRegisterDTO} signupDTO
   */
  public async signUp(signupDto: AuthSignupDto) {
    return this.authSignupService.signUp(signupDto);
  }

  /**
   * Verifying the provided user's email after signin-up.
   * @param {string} email - User email.
   * @param {string} token - Verification token.
   * @returns {Promise<SystemUser>}
   */
  public async signUpConfirm(email: string, token: string) {
    return this.authSignupConfirmService.signupConfirm(email, token);
  }

  /**
   * Re-sends the confirmation email of the given system user.
   * @param {number} userId - System user id.
   * @returns {Promise<void>}
   */
  public async signUpConfirmResend() {
    return this.authSignUpConfirmResendService.signUpConfirmResend();
  }

  /**
   * Generates and retrieve password reset token for the given user email.
   * @param {string} email
   * @return {<Promise<IPasswordReset>}
   */
  public async sendResetPassword(email: string) {
    return this.authSendResetPasswordService.sendResetPassword(email);
  }

  /**
   * Resets a user password from given token.
   * @param {string} token - Password reset token.
   * @param {string} password - New Password.
   * @return {Promise<void>}
   */
  public async resetPassword(token: string, password: string) {
    return this.authResetPasswordService.resetPassword(token, password);
  }

  /**
   * Retrieves the authentication meta for SPA.
   * @returns {Promise<IAuthGetMetaPOJO>}
   */
  public async getAuthMeta() {
    return this.authGetMeta.getAuthMeta();
  }

  /**
   * Retrieves the authenticated account meta.
   */
  public getAuthedAccount() {
    return this.getAuthedAccountService.getAccount();
  }
}
