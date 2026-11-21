import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import {
  CategoriesModule,
  TagsModule,
  PagesModule,
  EventsModule,
  KesiswaanProgramsModule,
  ActivitiesModule,
  AchievementsModule,
  ProgramsModule,
  DkvWorksModule,
  DkvJournalsModule,
  ExtracurricularsModule,
  GalleriesModule,
  TeachersModule,
  StaffModule,
  FacilitiesModule,
  DocumentsModule,
  StudentsModule,
  IndustryPartnersModule,
} from './content-modules';
import { DkvJournalStatsModule } from './dkv-journals/dkv-journal-stats.module';
import { JobVacanciesModule } from './job-vacancies/job-vacancies.module';
import { RoleMenusModule } from './role-menus/role-menus.module';
import { MediaModule } from './media/media.module';
import { PpdbModule } from './ppdb/ppdb.module';
import { MenusModule } from './menus/menus.module';
import { SeoModule } from './seo/seo.module';
import { SettingsModule } from './settings/settings.module';
import { RedirectsModule } from './redirects/redirects.module';
import { CommentsModule } from './comments/comments.module';
import { HomeSectionsModule } from './home-sections/home-sections.module';
import { PopupModule } from './popup/popup.module';
import { UnitGateMiddleware } from './common/middleware/unit-gate.middleware';
import { HealthModule } from './health/health.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    PagesModule,
    EventsModule,
    KesiswaanProgramsModule,
    ActivitiesModule,
    AchievementsModule,
    ProgramsModule,
    DkvWorksModule,
    DkvJournalsModule,
    DkvJournalStatsModule,
    JobVacanciesModule,
    RoleMenusModule,
    ExtracurricularsModule,
    GalleriesModule,
    TeachersModule,
    StaffModule,
    FacilitiesModule,
    DocumentsModule,
    StudentsModule,
    IndustryPartnersModule,
    MediaModule,
    PpdbModule,
    MenusModule,
    SeoModule,
    SettingsModule,
    RedirectsModule,
    CommentsModule,
    HomeSectionsModule,
    PopupModule,
    HealthModule,
    WhatsappModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // unit-gate diterapkan pada modul konten ber-unit (bukan auth/users/settings)
    consumer
      .apply(UnitGateMiddleware)
      .forRoutes(
        'api/posts',
        'api/pages',
        'api/events',
        'api/kesiswaan-programs',
        'api/achievements',
        'api/activities',
        'api/programs',
        'api/dkv-works',
        'api/extracurriculars',
        'api/galleries',
        'api/teachers',
        'api/staff',
        'api/facilities',
        'api/documents',
        'api/students',
      );
  }
}
