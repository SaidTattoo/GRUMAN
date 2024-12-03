import { Module } from '@nestjs/common';
import { UploadV2Service } from './upload-v2.service';
import { UploadV2Controller } from './upload-v2.controller';

@Module({
  providers: [UploadV2Service],
  controllers: [UploadV2Controller]
})
export class UploadV2Module {}
