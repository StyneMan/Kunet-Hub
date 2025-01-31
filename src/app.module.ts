import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';
import { RidersModule } from './riders/riders.module';
import { OrdersModule } from './orders/orders.module';
import { VendorsModule } from './vendors/vendors.module';
import { ProductsModule } from './products/products.module';
import { ParcelsModule } from './parcels/parcels.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Rider } from './entities/rider.entity';
import { Parcel } from './entities/parcel.entity';
import { Vendor } from './entities/vendor.entity';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
// import { OperatorService } from './operator/operator.service';
import { OperatorModule } from './operator/operator.module';
import { Operator } from './entities/operator.entity';
import { Service } from './entities/service.entity';
import { Bike } from './entities/bike.entity';
import { Size } from './entities/size.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { AdminOTP } from './entities/otp.admin.entity';
import { CustomerOTP } from './entities/otp.customer.entity';
import { RiderOTP } from './entities/otp.rider.entity';
import { OperatorOTP } from './entities/otp.operator.entity';
import { FAQ } from './entities/faq.entity';
import { Color } from './entities/color.entity';
import { ZonesModule } from './zones/zones.module';
import { Zone } from './entities/zone.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// import { BankController } from './bank/bank.controller';
import { BankModule } from './bank/bank.module';
import { Category } from './entities/category.entity';
import { Cart } from './entities/cart.entity';
import { OperatorActivity } from './entities/operator.activity.entity';
import { AdminActivity } from './entities/admin.activity.entity';
import { RiderBank } from './entities/rider.bank.entity';
import { VendorBank } from './entities/vendor.bank.entity';
import { Admin } from './entities/admin.entity';
import { Address } from './entities/address.entity';
import { RiderDocument } from './entities/rider.document.entity';
import { OperatorDocument } from './entities/operator.document.entity';
import { AppController } from './app.controller';
import { SettingsModule } from './settings/settings.module';
import { Legal } from './entities/legal.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupportsModule } from './supports/supports.module';
import { Support } from './entities/support.entity';
import { SmsService } from './sms/sms.service';
import { SMSProviders } from './entities/sms.provider.entity';
import { PlivoService } from './sms/providers/plivo.service';
import { TwilioService } from './sms/providers/twilio.service';
import { BroadnetService } from './sms/providers/broadnet.service';
import { SendChampService } from './sms/providers/sendchamp.service';
import { TermiiService } from './sms/providers/termii.service';
import { CustomerWallet } from './entities/customer.wallet.entity';
import { PackOption } from './entities/pack.option.entity';
import { CustomerFavourites } from './entities/customer.favourites.entity';
import { CartItem } from './entities/cart.item.entity';
import { SocketModule } from './socket/socket.module';
import { CustomerTransactions } from './entities/customer.transactions.entity';
import { Coupon } from './entities/coupon.entity';
import { NotificationService } from './notification/notification.service';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat.message.entity';
import { ChatModule } from './chat/chat.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SystemTransactions } from './entities/system.transactions.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        legacySpatialSupport: false,
        entities: [
          Customer,
          Operator,
          Service,
          Admin,
          Rider,
          Bike,
          RiderDocument,
          OperatorDocument,
          Size,
          Chat,
          Product,
          Order,
          ChatMessage,
          PaymentEntity,
          AdminOTP,
          CustomerOTP,
          RiderOTP,
          OperatorOTP,
          FAQ,
          Color,
          Parcel,
          Vendor,
          Zone,
          Coupon,
          Category,
          Cart,
          Legal,
          CartItem,
          OperatorActivity,
          AdminActivity,
          RiderBank,
          VendorBank,
          Address,
          Support,
          PackOption,
          SMSProviders,
          CustomerWallet,
          SystemTransactions,
          CustomerFavourites,
          CustomerTransactions,
        ],
        cache: false,
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'abcdfast123BuyJakasMan123@09nmdhyuDiloe((30(())',
      signOptions: { expiresIn: '1d' },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: +configService.get<number>('MAIL_PORT'),
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"FastBuy" <${configService.get<string>('MAIL_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'uploads'), // Specify the directory where your upload files are located
        serveRoot: '/uploads', // Specify the route prefix under which to serve the files
      },
      {
        rootPath: join(__dirname, '..', 'views'),
        serveRoot: '/views',
      },
    ),
    AuthModule,
    OperatorModule,
    AdminModule,
    CustomerModule,
    RidersModule,
    OrdersModule,
    VendorsModule,
    ProductsModule,
    ParcelsModule,
    ZonesModule,
    BankModule,
    SettingsModule,
    SupportsModule,
    SocketModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SmsService,
    PlivoService,
    TwilioService,
    TermiiService,
    BroadnetService,
    SendChampService,
    NotificationService,
  ],
})
export class AppModule {}
