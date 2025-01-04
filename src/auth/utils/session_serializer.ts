// import { Inject } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AdminService } from 'src/admin/admin.service';
import { CustomerService } from 'src/customer/customer.service';
import { OperatorService } from 'src/operator/operator.service';
import { RidersService } from 'src/riders/riders.service';

export class SessionSerializer extends PassportSerializer {
  constructor(
    private readonly adminService: AdminService,
    private readonly riderService: RidersService,
    private readonly customerService: CustomerService,
    private readonly operatorService: OperatorService,
  ) {
    super();
  }

  serializeUser(user: any, done: (err: any, user: any) => void) {
    done(null, user);
  }

  async deserializeUser(user: any, done: (err: any, user: any) => void) {
    if (user?.user_type === 'admin') {
      const userDB = await this.adminService.findAdminById(
        user?.id ?? user?._id,
      );
      return userDB ? done(null, userDB) : done(null, null);
    } else if (user?.user_type === 'customer') {
      const userDB = await this.customerService.findCustomerById(
        user?.id ?? user?._id,
      );
      return userDB ? done(null, userDB) : done(null, null);
    } else if (user?.user_type === 'operator') {
      const userDB = await this.operatorService.findOperatorById(
        user?.id ?? user?._id,
      );
      return userDB ? done(null, userDB) : done(null, null);
    } else if (user?.user_type === 'rider') {
      const userDB = await this.riderService.findUserById(
        user?.id ?? user?._id,
      );
      return userDB ? done(null, userDB) : done(null, null);
    }
  }
}
