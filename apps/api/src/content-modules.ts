// Modul konten yang memakai generic CRUD factory.
// Setiap modul tetap berdiri sendiri agar mudah diekstrak ke repo terpisah.
import { makeCrudModule, type CrudConfig } from './common/factory/crud.factory';

const WRITE_ADMIN: CrudConfig['writeRoles'] = ['ADMIN'];
const WRITE_EDITOR: CrudConfig['writeRoles'] = ['EDITOR', 'ADMIN'];

export const CategoriesModule = makeCrudModule('categories', 'categories', {
  model: 'category',
  fields: ['name', 'slug', 'unit', 'type'],
  searchFields: ['name'],
  orderBy: { name: 'asc' }, // model Category tidak punya updatedAt
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  slugFrom: 'name',
});

export const TagsModule = makeCrudModule('tags', 'tags', {
  model: 'tag',
  fields: ['name', 'slug'],
  searchFields: ['name'],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  slugFrom: 'name',
});

export const PagesModule = makeCrudModule('pages', 'pages', {
  model: 'page',
  fields: ['unit', 'title', 'slug', 'content', 'heroImage', 'status', 'authorId', 'parentId', 'seoTitle', 'seoDescription', 'ogImage', 'publishedAt'],
  searchFields: ['title'],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  includeGlobal: true,
  slugFrom: 'title',
  dateFields: ['publishedAt'],
  emptyToNull: ['unit', 'parentId', 'authorId'],
});

export const EventsModule = makeCrudModule('events', 'events', {
  model: 'event',
  fields: ['unit', 'title', 'slug', 'description', 'content', 'location', 'featuredImage', 'startDate', 'endDate', 'allDay', 'status', 'seoTitle', 'seoDescription'],
  searchFields: ['title'],
  orderBy: { startDate: 'asc' },
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'title',
  dateFields: ['startDate', 'endDate'],
});

export const ActivitiesModule = makeCrudModule('activities', 'activities', {
  model: 'activity',
  fields: ['unit', 'title', 'slug', 'description', 'image', 'category', 'order', 'featured', 'status', 'publishedAt', 'seoTitle', 'seoDescription'],
  searchFields: ['title', 'category'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'title',
  dateFields: ['publishedAt'],
});

export const AchievementsModule = makeCrudModule('achievements', 'achievements', {
  model: 'achievement',
  fields: ['unit', 'studentName', 'photo', 'className', 'competition', 'category', 'rank', 'organizer', 'date', 'year', 'description', 'type', 'status', 'publishedAt', 'seoTitle', 'seoDescription'],
  searchFields: ['studentName', 'competition'],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  dateFields: ['date', 'publishedAt'],
});

export const ProgramsModule = makeCrudModule('programs', 'programs', {
  model: 'program',
  fields: ['unit', 'name', 'slug', 'description', 'content', 'icon', 'image', 'featured', 'order', 'status', 'seoTitle', 'seoDescription'],
  searchFields: ['name'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  includeGlobal: true,
  slugFrom: 'name',
  emptyToNull: ['unit'],
});

export const ExtracurricularsModule = makeCrudModule('extracurriculars', 'extracurriculars', {
  model: 'extracurricular',
  fields: ['unit', 'name', 'slug', 'description', 'image', 'schedule', 'order', 'status'],
  searchFields: ['name'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'name',
});

export const GalleriesModule = makeCrudModule('galleries', 'galleries', {
  model: 'gallery',
  fields: ['unit', 'title', 'slug', 'description', 'coverImage', 'kind', 'status', 'publishedAt'],
  searchFields: ['title'],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  includeGlobal: true,
  slugFrom: 'title',
  dateFields: ['publishedAt'],
  emptyToNull: ['unit'],
  include: { items: { orderBy: { order: 'asc' } } },
} as CrudConfig);

export const TeachersModule = makeCrudModule('teachers', 'teachers', {
  model: 'teacher',
  fields: ['unit', 'name', 'position', 'subject', 'photo', 'email', 'phone', 'education', 'bio', 'order', 'isPimpinan', 'isActive'],
  searchFields: ['name'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_ADMIN,
  publicRead: true,
});

export const StaffModule = makeCrudModule('staff', 'staff', {
  model: 'staff',
  fields: ['unit', 'name', 'position', 'photo', 'email', 'order', 'isActive'],
  searchFields: ['name'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_ADMIN,
  publicRead: true,
});

export const FacilitiesModule = makeCrudModule('facilities', 'facilities', {
  model: 'facility',
  fields: ['unit', 'name', 'slug', 'description', 'image', 'order', 'status'],
  searchFields: ['name'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_ADMIN,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'name',
});

export const DocumentsModule = makeCrudModule('documents', 'documents', {
  model: 'document',
  fields: ['unit', 'title', 'type', 'fileUrl', 'description', 'order'],
  searchFields: ['title'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_ADMIN,
  publicRead: true,
});

export const StudentsModule = makeCrudModule('students', 'students', {
  model: 'student',
  fields: ['unit', 'name', 'className', 'photo', 'bio', 'featured', 'status'],
  searchFields: ['name'],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
});
