import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Admin } from 'src/entities/admin.entity';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { AdminActivity } from 'src/entities/admin.activity.entity';
import { ShippingAddress } from 'src/entities/shipping.address.entity';
import { CustomerWallet } from 'src/entities/customer.wallet.entity';
import { CustomerFavourites } from 'src/entities/customer.favourites.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { CartItem } from 'src/entities/cart.item.entity';
import { SocketModule } from 'src/socket/socket.module';
import { CustomerTransactions } from 'src/entities/customer.transactions.entity';
import { Coupon } from 'src/entities/coupon.entity';
import { Order } from 'src/entities/order.entity';
import { VendorLocation } from 'src/entities/vendor.location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Admin,
      Cart,
      Order,
      Product,
      Vendor,
      CartItem,
      Coupon,
      AdminActivity,
      CustomerWallet,
      ShippingAddress,
      VendorLocation,
      CustomerFavourites,
      CustomerTransactions,
    ]),
    SocketModule,
  ],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
