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
  ActivitiesModule,
  AchievementsModule,
  ProgramsModule,
  ExtracurricularsModule,
  GalleriesModule,
  TeachersModule,
  StaffModule,
  FacilitiesModule,
  DocumentsModule,
  StudentsModule,
} from './content-modules';
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
    ActivitiesModule,
    AchievementsModule,
    ProgramsModule,
    ExtracurricularsModule,
    GalleriesModule,
    TeachersModule,
    StaffModule,
    FacilitiesModule,
    DocumentsModule,
    StudentsModule,
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
        'api/achievements',
        'api/activities',
        'api/programs',
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
