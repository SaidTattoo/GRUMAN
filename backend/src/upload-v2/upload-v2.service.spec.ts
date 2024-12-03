import { Test, TestingModule } from '@nestjs/testing';
import { UploadV2Service } from './upload-v2.service';

describe('UploadV2Service', () => {
  let service: UploadV2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadV2Service],
    }).compile();

    service = module.get<UploadV2Service>(UploadV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
