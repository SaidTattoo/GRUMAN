import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/user.entity';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    try {
      const userCount = await this.userRepository.count();
      this.logger.log(
        `Database connection established. User count: ${userCount}`,
      );
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
