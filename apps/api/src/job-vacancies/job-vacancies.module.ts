import { Module } from '@nestjs/common';
import { JobVacanciesController } from './job-vacancies.controller';
import { JobVacanciesService } from './job-vacancies.service';

@Module({
  controllers: [JobVacanciesController],
  providers: [JobVacanciesService],
  exports: [JobVacanciesService],
})
export class JobVacanciesModule {}
