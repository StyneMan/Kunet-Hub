import { Injectable } from '@nestjs/common';
import { RiderAuthService } from './auth-services/rider.auth.service';
import { CustomerAuthService } from './auth-services/customer.auth.service';
import { AdminAuthService } from './auth-services/admin.auth.service';
import { OperatorAuthService } from './auth-services/operator.auth.service';
import { CreateAdminDTO } from 'src/admin/dtos/createadmin.dto';
import { LoginAdminDTO } from 'src/admin/dtos/loginadmin.dto';
import { LoginRiderDTO } from 'src/riders/dtos/loginrider.dto';
import { LoginCustomerDTO } from 'src/customer/dtos/logincustomer.dto';
import { ResetPasswordAdminDTO } from 'src/admin/dtos/resetpasswordadmin.dto';
import { UserType } from 'src/enums/user.type.enum';
import { RegisterCustomerDTO } from 'src/customer/dtos/registercustomer.dto';
import { SendOTPDTO } from 'src/commons/dtos/sendotp.dto';
import { VerifyOTPDTO } from 'src/commons/dtos/verifyotp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminAuthService,
    private readonly riderService: RiderAuthService,
    private readonly customerService: CustomerAuthService,
    private readonly operatorService: OperatorAuthService,
  ) {}

  validateUser(username: string, password: string, user_type: UserType) {
    if (user_type === 'admin') {
      return this.adminService.validateAdmin(username, password);
    } else if (user_type === 'customer') {
      return this.customerService.validateCustomer(username, password);
    } else if (user_type === 'operator') {
      return this.operatorService.validateOperator(username, password);
    } else if (user_type === 'rider') {
      return this.riderService.validateRider(username, password);
    }
  }

  createAdmin(payload: CreateAdminDTO) {
    return this.adminService.validateCreateAdmin(payload);
  }

  sendOTPAdmin(payload: SendOTPDTO) {
    return this.adminService.sendOTP(payload);
  }

  validateVerifyOTPAdmin(payload: VerifyOTPDTO) {
    return this.adminService.validateVerifyOTP(payload);
  }

  loginAdmin(payload: LoginAdminDTO) {
    return this.adminService.validateLogin(payload);
  }

  sendPasswordResetEmailAdmin({ email_address }: SendOTPDTO) {
    return this.adminService.sendPasswordResetEmail(email_address);
  }

  resetPasswordAdmin({
    new_password,
    confirm_password,
    email_address,
  }: ResetPasswordAdminDTO) {
    return this.adminService.resetPassword(
      new_password,
      confirm_password,
      email_address,
    );
  }

  // RIDER SECTION HERE .......
  resendOTPRider(payload: SendOTPDTO) {
    return this.riderService.sendOTP(payload);
  }

  validateVerifyOTPRider(payload: VerifyOTPDTO) {
    return this.riderService.validateVerifyOTP(payload);
  }

  loginRider(payload: LoginRiderDTO) {
    return this.riderService.validateLogin(payload);
  }

  sendPasswordResetEmailRider(email_address: string) {
    return this.riderService.sendPasswordResetEmail(email_address);
  }

  resetPasswordRider({
    new_password,
    confirm_password,
    email_address,
  }: ResetPasswordAdminDTO) {
    return this.riderService.resetPassword(
      new_password,
      confirm_password,
      email_address,
    );
  }

  // OPERATOR SECTION HERE .......
  resendOTPOperator(payload: SendOTPDTO) {
    return this.operatorService.sendOTP(payload);
  }

  validateVerifyOTPOperator(payload: VerifyOTPDTO) {
    return this.operatorService.validateVerifyOTP(payload);
  }

  loginOperator(payload: LoginRiderDTO) {
    return this.operatorService.validateLogin(payload);
  }

  sendPasswordResetEmailOperator(email_address: string) {
    return this.operatorService.sendPasswordResetEmail(email_address);
  }

  resetPasswordOperator({
    new_password,
    confirm_password,
    email_address,
  }: ResetPasswordAdminDTO) {
    return this.operatorService.resetPassword(
      new_password,
      confirm_password,
      email_address,
    );
  }

  // CUSTOMER SECTION HERE .......
  createCustomer(payload: RegisterCustomerDTO) {
    return this.customerService.validateCreateUser(payload);
  }

  resendOTPCustomer(payload: SendOTPDTO) {
    return this.customerService.sendOTP(payload);
  }

  validateVerifyOTPCustomer(payload: VerifyOTPDTO) {
    return this.customerService.validateVerifyOTP(payload);
  }

  loginCustomer(payload: LoginCustomerDTO) {
    return this.customerService.validateLogin(payload);
  }

  sendPasswordResetEmailCustomer(email_address: string) {
    return this.customerService.sendPasswordResetEmail(email_address);
  }

  resetPasswordCustomer({
    new_password,
    confirm_password,
    email_address,
  }: ResetPasswordAdminDTO) {
    return this.customerService.resetPassword(
      new_password,
      confirm_password,
      email_address,
    );
  }
}
