import { Injectable } from '@nestjs/common';
import { uploadImage, uploadMultipleImages } from './utils/image-upload';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  imageUploader(image: any) {
    return uploadImage(image);
  }

  imagesUploader(images: any[]) {
    return uploadMultipleImages(images);
  }
}
