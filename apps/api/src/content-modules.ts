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
  fields: ['unit', 'title', 'slug', 'description', 'content', 'location', 'featuredImage', 'timeType', 'timeText', 'startDate', 'endDate', 'allDay', 'indikator', 'buktiFisik', 'tercapai', 'keterangan', 'status', 'seoTitle', 'seoDescription'],
  searchFields: ['title'],
  orderBy: [{ startDate: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'title',
  dateFields: ['startDate', 'endDate'],
  emptyToNull: ['location', 'indikator', 'buktiFisik', 'keterangan', 'timeText'],
  sortOrderBy: { newest: [{ startDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }] },
  monthField: 'startDate',
});

export const KesiswaanProgramsModule = makeCrudModule('kesiswaan-programs', 'kesiswaan-programs', {
  model: 'kesiswaanProgram',
  fields: ['unit', 'title', 'slug', 'objective', 'description', 'personInCharge', 'timeType', 'timeText', 'startDate', 'endDate', 'status', 'seoTitle', 'seoDescription'],
  searchFields: ['title', 'personInCharge', 'objective', 'description'],
  orderBy: [{ startDate: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'title',
  dateFields: ['startDate', 'endDate'],
  emptyToNull: ['objective', 'description', 'personInCharge', 'timeText'],
  sortOrderBy: { newest: [{ startDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }] },
  monthField: 'startDate',
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
  sortOrderBy: { newest: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }] },
});

export const AchievementsModule = makeCrudModule('achievements', 'achievements', {
  model: 'achievement',
  fields: ['unit', 'studentName', 'photo', 'className', 'competition', 'category', 'rank', 'organizer', 'date', 'year', 'description', 'type', 'status', 'publishedAt', 'seoTitle', 'seoDescription'],
  searchFields: ['studentName', 'competition'],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  dateFields: ['date', 'publishedAt'],
  sortOrderBy: { newest: [{ date: { sort: 'desc', nulls: 'last' } }, { year: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }] },
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

export const DkvWorksModule = makeCrudModule('dkv-works', 'dkv-works', {
  model: 'dkvWork',
  fields: ['unit', 'title', 'slug', 'description', 'image', 'mediaType', 'file', 'category', 'author', 'workDate', 'order', 'featured', 'status', 'publishedAt', 'seoTitle', 'seoDescription'],
  searchFields: ['title', 'description', 'category', 'author'],
  orderBy: { workDate: 'desc' },
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'title',
  dateFields: ['workDate', 'publishedAt'],
  sortOrderBy: { newest: [{ workDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }] },
  monthField: 'workDate',
});

export const DkvJournalsModule = makeCrudModule('dkv-journals', 'dkv-journals', {
  model: 'dkvJournal',
  fields: ['title', 'slug', 'journalDate', 'publishedAt', 'summary', 'author', 'content', 'thumbnail', 'fileUrl', 'fileName', 'status', 'seoTitle', 'seoDescription'],
  searchFields: ['title', 'author', 'summary'],
  orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'title',
  dateFields: ['journalDate', 'publishedAt'],
  sortOrderBy: { newest: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { journalDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }] },
  monthField: 'publishedAt',
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

export const IndustryPartnersModule = makeCrudModule('industry-partners', 'industry-partners', {
  model: 'industryPartner',
  fields: ['name', 'slug', 'logo', 'description', 'order', 'status', 'publishedAt'],
  searchFields: ['name', 'description'],
  orderBy: { order: 'asc' },
  writeRoles: WRITE_EDITOR,
  publicRead: true,
  publicStatusFilter: true,
  slugFrom: 'name',
  dateFields: ['publishedAt'],
});
