CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`auth_uid` text NOT NULL,
	`user_type` text DEFAULT 'staff' NOT NULL,
	`display_name` text NOT NULL,
	`email` text,
	`phone` text,
	`avatar_url` text,
	`primary_role_key` text DEFAULT 'admin' NOT NULL,
	`notes` text,
	CONSTRAINT "users_type_check" CHECK("users"."user_type" in ('staff','guardian','student')),
	CONSTRAINT "users_primary_role_check" CHECK("users"."primary_role_key" in ('superadmin','admin','media','guardian','student'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth_uid_uidx` ON `users` (`auth_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uidx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`primary_role_key`);--> statement-breakpoint
CREATE INDEX `users_active_idx` ON `users` (`is_active`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`brand_name` text,
	`legal_name` text,
	`logo_url` text,
	`timezone` text DEFAULT 'Asia/Jakarta' NOT NULL,
	`locale` text DEFAULT 'id-ID' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_code_uidx` ON `tenants` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_uidx` ON `tenants` (`slug`);--> statement-breakpoint
CREATE INDEX `tenants_active_idx` ON `tenants` (`is_active`);--> statement-breakpoint
CREATE TABLE `roles` (
	`key` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	CONSTRAINT "roles_key_check" CHECK("roles"."key" in ('superadmin','admin','media','guardian','student'))
);
--> statement-breakpoint
CREATE TABLE `user_route_grants` (
	`tenant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`route` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	PRIMARY KEY(`tenant_id`, `user_id`, `route`)
);
--> statement-breakpoint
CREATE TABLE `user_tenant_roles` (
	`tenant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role_key` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	PRIMARY KEY(`tenant_id`, `user_id`, `role_key`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_tenant_roles_unique` ON `user_tenant_roles` (`tenant_id`,`user_id`,`role_key`);--> statement-breakpoint
CREATE TABLE `dorm_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`code` text,
	`name` text NOT NULL,
	`note` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dorm_blocks_tenant_name_uidx` ON `dorm_blocks` (`tenant_id`,`name`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`dorm_block_id` text,
	`room_code` text NOT NULL,
	`room_name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_tenant_code_uidx` ON `rooms` (`tenant_id`,`room_code`);--> statement-breakpoint
CREATE INDEX `rooms_dorm_idx` ON `rooms` (`dorm_block_id`);--> statement-breakpoint
CREATE TABLE `guardians` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`user_id` text,
	`full_name` text NOT NULL,
	`relation_label` text,
	`phone` text,
	`email` text,
	`address` text,
	`occupation` text
);
--> statement-breakpoint
CREATE INDEX `guardians_tenant_user_idx` ON `guardians` (`tenant_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `guardians_name_idx` ON `guardians` (`full_name`);--> statement-breakpoint
CREATE TABLE `student_guardians` (
	`tenant_id` text NOT NULL,
	`student_id` text NOT NULL,
	`guardian_id` text NOT NULL,
	`relation_type` text NOT NULL,
	`is_primary` text DEFAULT 'false' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `student_guardians_unique` ON `student_guardians` (`tenant_id`,`student_id`,`guardian_id`,`relation_type`);--> statement-breakpoint
CREATE TABLE `student_indexes` (
	`tenant_id` text NOT NULL,
	`key` text NOT NULL,
	`student_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `student_indexes_key_uidx` ON `student_indexes` (`tenant_id`,`key`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`user_id` text,
	`full_name` text NOT NULL,
	`student_no` text NOT NULL,
	`birth_text` text,
	`gender` text,
	`generation` text,
	`level` text,
	`type` text,
	`status` text DEFAULT 'aktif' NOT NULL,
	`formal_class_text` text,
	`diniyah_class_text` text,
	`dorm_block_text` text,
	`room_text` text,
	`dorm_block_id` text,
	`room_id` text,
	`address` text,
	`phone` text,
	`occupation_family` text,
	`father_name` text,
	`mother_name` text,
	`guardian_name` text,
	`rfid_uid` text,
	`fingerprint_code` text,
	`ppdb_code` text,
	`monthly_visit_quota` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_tenant_student_no_uidx` ON `students` (`tenant_id`,`student_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_tenant_legacy_uidx` ON `students` (`tenant_id`,`legacy_id`);--> statement-breakpoint
CREATE INDEX `students_name_idx` ON `students` (`full_name`);--> statement-breakpoint
CREATE INDEX `students_status_idx` ON `students` (`status`);--> statement-breakpoint
CREATE INDEX `students_user_idx` ON `students` (`user_id`);--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`user_id` text,
	`full_name` text NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`birthplace` text,
	`nik` text,
	`nip` text,
	`nuptk` text,
	`institution` text,
	`position_main` text,
	`positions_json` text,
	`main_subject` text,
	`education_level` text,
	`education_major` text,
	`school_level` text,
	`graduation_year` text,
	`employment_status` text,
	`educator_certificate` text,
	`ppg_year` text,
	`rank` text,
	`grade_group` text,
	`is_active_teacher` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teachers_tenant_legacy_uidx` ON `teachers` (`tenant_id`,`legacy_id`);--> statement-breakpoint
CREATE INDEX `teachers_name_idx` ON `teachers` (`full_name`);--> statement-breakpoint
CREATE INDEX `teachers_user_idx` ON `teachers` (`user_id`);--> statement-breakpoint
CREATE TABLE `class_memberships` (
	`tenant_id` text NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`added_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `class_memberships_unique` ON `class_memberships` (`tenant_id`,`class_id`,`student_id`);--> statement-breakpoint
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`level` text,
	`category` text,
	`room_text` text,
	`section` text,
	`color` text,
	`is_archived` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classes_tenant_code_uidx` ON `classes` (`tenant_id`,`code`);--> statement-breakpoint
CREATE INDEX `classes_level_idx` ON `classes` (`level`);--> statement-breakpoint
CREATE TABLE `student_class_assignments` (
	`tenant_id` text NOT NULL,
	`student_id` text NOT NULL,
	`class_id` text NOT NULL,
	`source` text DEFAULT 'santri_classes' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `student_class_assignments_unique` ON `student_class_assignments` (`tenant_id`,`student_id`,`class_id`,`source`);--> statement-breakpoint
CREATE TABLE `class_forum_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`class_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text
);
--> statement-breakpoint
CREATE TABLE `class_materials` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`class_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`file_path` text,
	`file_url` text
);
--> statement-breakpoint
CREATE TABLE `class_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`class_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_at` text
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`term_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`student_id` text NOT NULL,
	`daily_score` integer,
	`task_score` integer,
	`mid_score` integer,
	`final_exam_score` integer,
	`final_score` integer,
	`grade_letter` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grades_unique` ON `grades` (`tenant_id`,`term_id`,`subject_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `grades_student_idx` ON `grades` (`student_id`);--> statement-breakpoint
CREATE TABLE `report_terms` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`term_code` text NOT NULL,
	`title` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `report_terms_tenant_code_uidx` ON `report_terms` (`tenant_id`,`term_code`);--> statement-breakpoint
CREATE TABLE `memorization_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`student_id` text NOT NULL,
	`evaluator_name` text,
	`type` text,
	`surah` text,
	`juz` integer,
	`halaman` integer,
	`ayat_from` integer,
	`ayat_to` integer,
	`score` integer,
	`grade_letter` text,
	`status` text,
	`note` text,
	`submitted_at` text
);
--> statement-breakpoint
CREATE INDEX `memorization_student_idx` ON `memorization_entries` (`student_id`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`group_name` text,
	`level` text,
	`minimum_score` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_tenant_code_uidx` ON `subjects` (`tenant_id`,`code`);--> statement-breakpoint
CREATE INDEX `subjects_level_idx` ON `subjects` (`level`);--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`group_key` text DEFAULT 'gallery' NOT NULL,
	`title` text,
	`caption` text,
	`image_url` text NOT NULL,
	`image_alt` text,
	`item_type` text DEFAULT 'image' NOT NULL,
	`link_url` text
);
--> statement-breakpoint
CREATE INDEX `gallery_items_group_sort_idx` ON `gallery_items` (`tenant_id`,`group_key`,`sort_order`);--> statement-breakpoint
CREATE INDEX `gallery_items_active_idx` ON `gallery_items` (`is_active`);--> statement-breakpoint
CREATE UNIQUE INDEX `gallery_items_tenant_group_image_uidx` ON `gallery_items` (`tenant_id`,`group_key`,`image_url`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`kind` text DEFAULT 'image' NOT NULL,
	`file_name` text,
	`mime_type` text,
	`public_url` text NOT NULL,
	`storage_key` text,
	`alt_text` text,
	`title` text,
	`caption` text,
	`folder` text DEFAULT 'cms',
	`size_bytes` integer,
	`width` integer,
	`height` integer,
	`metadata_json` text,
	CONSTRAINT "media_assets_kind_check" CHECK("media_assets"."kind" in ('image', 'video', 'file'))
);
--> statement-breakpoint
CREATE INDEX `media_assets_tenant_idx` ON `media_assets` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `media_assets_folder_idx` ON `media_assets` (`folder`);--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_tenant_storage_key_uidx` ON `media_assets` (`tenant_id`,`storage_key`);--> statement-breakpoint
CREATE TABLE `news_history` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`news_post_id` text NOT NULL,
	`action` text NOT NULL,
	`author_name` text,
	`author_email` text,
	`author_role` text,
	`author_uid` text,
	`occurred_at` text NOT NULL,
	`meta_json` text,
	FOREIGN KEY (`news_post_id`) REFERENCES `news_posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `news_history_post_idx` ON `news_history` (`news_post_id`);--> statement-breakpoint
CREATE INDEX `news_history_action_idx` ON `news_history` (`action`);--> statement-breakpoint
CREATE TABLE `news_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`category` text,
	`tags_json` text,
	`cover_url` text,
	`read_time_minutes` integer,
	`content_html` text,
	`content_json` text,
	`content_kind` text DEFAULT 'html',
	CONSTRAINT "news_posts_status_check" CHECK("news_posts"."status" in ('draft', 'published', 'archived'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_posts_tenant_slug_uidx` ON `news_posts` (`tenant_id`,`slug`);--> statement-breakpoint
CREATE INDEX `news_posts_tenant_status_idx` ON `news_posts` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `news_posts_published_idx` ON `news_posts` (`published_at`);--> statement-breakpoint
CREATE INDEX `news_posts_category_idx` ON `news_posts` (`category`);--> statement-breakpoint
CREATE TABLE `cms_page_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`page_id` text NOT NULL,
	`section_key` text NOT NULL,
	`section_type` text NOT NULL,
	`title` text,
	`subtitle` text,
	`body_text` text,
	`image_url` text,
	`image_alt` text,
	`cta_label` text,
	`cta_url` text,
	`content_json` text,
	`settings_json` text,
	FOREIGN KEY (`page_id`) REFERENCES `cms_pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_page_sections_page_key_uidx` ON `cms_page_sections` (`page_id`,`section_key`);--> statement-breakpoint
CREATE INDEX `cms_page_sections_page_sort_idx` ON `cms_page_sections` (`page_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `cms_page_sections_tenant_page_idx` ON `cms_page_sections` (`tenant_id`,`page_id`);--> statement-breakpoint
CREATE TABLE `cms_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`slug` text NOT NULL,
	`page_type` text DEFAULT 'custom' NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`summary` text,
	`hero_image_url` text,
	`seo_title` text,
	`seo_description` text,
	`seo_image_url` text,
	CONSTRAINT "cms_pages_status_check" CHECK("cms_pages"."status" in ('draft', 'published', 'archived')),
	CONSTRAINT "cms_pages_type_check" CHECK("cms_pages"."page_type" in ('home', 'profile', 'custom'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_pages_tenant_slug_uidx` ON `cms_pages` (`tenant_id`,`slug`);--> statement-breakpoint
CREATE INDEX `cms_pages_tenant_status_idx` ON `cms_pages` (`tenant_id`,`status`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`address` text,
	`email` text,
	`phone` text,
	`wa_intl` text,
	`hours_json` text,
	`map_embed_src` text,
	`map_query` text,
	`footer_brand_name` text,
	`footer_brand_desc` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `navbar_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`title` text NOT NULL,
	`href` text,
	`description` text,
	`image_url` text,
	`group_key` text DEFAULT 'main'
);
--> statement-breakpoint
CREATE INDEX `navbar_items_group_sort_idx` ON `navbar_items` (`tenant_id`,`group_key`,`sort_order`);--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`label` text NOT NULL,
	`icon` text,
	`href` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `social_links_sort_idx` ON `social_links` (`tenant_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `app_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`issuer` text,
	`secret_hash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registration_settings` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`year` integer,
	`is_closed` integer DEFAULT false NOT NULL,
	`auto_close_enabled` integer DEFAULT false NOT NULL,
	`auto_close_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tenant_settings` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`theme` text,
	`primary_color` text,
	`secondary_color` text,
	`locale` text,
	`timezone` text,
	`date_format` text,
	`density` text,
	`page_size` text,
	`font_scale` text,
	`smooth_animations` text,
	`maintenance` text,
	`email_notifications` text,
	`email_daily_time` text,
	`email_primary` text,
	`notify_on` text,
	`critical_threshold` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`session_id` text,
	`student_id` text,
	`source` text,
	`device_id` text,
	`room_text` text,
	`dorm_block_text` text,
	`name_snapshot` text,
	`rfid_uid` text,
	`fingerprint_id` integer,
	`fingerprint_status` text,
	`occurred_at_ms` integer
);
--> statement-breakpoint
CREATE INDEX `attendance_student_idx` ON `attendance_records` (`student_id`);--> statement-breakpoint
CREATE INDEX `attendance_session_idx` ON `attendance_records` (`session_id`);--> statement-breakpoint
CREATE TABLE `attendance_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`session_key` text NOT NULL,
	`started_at` text,
	`ended_at` text,
	`reset_by` text,
	`total` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `attendance_settings` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`last_reset_at` text,
	`last_reset_key` text,
	`reset_time` text,
	`reset_times_json` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `billing_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`term_code` text NOT NULL,
	`year_month` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `billing_periods_tenant_code_uidx` ON `billing_periods` (`tenant_id`,`term_code`);--> statement-breakpoint
CREATE TABLE `charge_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`billing_period_id` text NOT NULL,
	`charge_template_id` text NOT NULL,
	`scope_type` text NOT NULL,
	`dorm_block_text` text,
	`room_text` text,
	`amount` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `charge_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `charge_templates_unique` ON `charge_templates` (`tenant_id`,`code`);--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`invoice_id` text NOT NULL,
	`charge_code` text,
	`title` text NOT NULL,
	`original_amount` integer DEFAULT 0 NOT NULL,
	`discount_amount` integer DEFAULT 0 NOT NULL,
	`final_amount` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`billing_period_id` text NOT NULL,
	`student_id` text NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `character_records` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`student_id` text,
	`student_name_snapshot` text,
	`term_code` text,
	`title` text,
	`type` text,
	`category` text,
	`severity` text,
	`points` integer,
	`description` text,
	`handled_by` text,
	`reported_by` text,
	`location` text,
	`status` text,
	`occurred_at` text
);
--> statement-breakpoint
CREATE TABLE `discipline_faults` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`student_id` text,
	`student_name_snapshot` text,
	`reporter_name` text,
	`type` text,
	`category` text,
	`level` text,
	`room_text` text,
	`dorm_block_text` text,
	`points` integer,
	`action_taken` text,
	`attachment_url` text,
	`description` text,
	`status` text,
	`occurred_at` text
);
--> statement-breakpoint
CREATE TABLE `leave_events` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`leave_request_id` text NOT NULL,
	`event_type` text NOT NULL,
	`actor_user_id` text,
	`payload_json` text,
	`occurred_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`student_id` text,
	`student_name_snapshot` text,
	`room_text` text,
	`dorm_block_text` text,
	`reason` text,
	`note` text,
	`urgency` text,
	`status` text,
	`requested_at` text,
	`approved_at` text,
	`out_at` text,
	`returned_at` text,
	`planned_out_at` text,
	`planned_return_at` text,
	`pickup_name` text,
	`pickup_relation` text,
	`pickup_phone` text,
	`address_snapshot` text
);
--> statement-breakpoint
CREATE TABLE `picket_members` (
	`tenant_id` text NOT NULL,
	`schedule_id` text NOT NULL,
	`student_id` text NOT NULL,
	`student_name_snapshot` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `picket_members_unique` ON `picket_members` (`tenant_id`,`schedule_id`,`student_id`);--> statement-breakpoint
CREATE TABLE `picket_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`group_key` text NOT NULL,
	`weekday` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rfid_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`student_id` text,
	`action` text,
	`previous_uid` text,
	`uid` text,
	`occurred_at_ms` integer
);
--> statement-breakpoint
CREATE TABLE `rfid_bindings` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`student_id` text NOT NULL,
	`card_uid` text NOT NULL,
	`student_name_snapshot` text,
	`dorm_block_text` text,
	`room_text` text
);
--> statement-breakpoint
CREATE TABLE `rfid_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`uid` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rfid_cards_uidx` ON `rfid_cards` (`tenant_id`,`uid`);--> statement-breakpoint
CREATE TABLE `rfid_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`uid` text NOT NULL,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `rfid_scans` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`uid` text,
	`device_id` text,
	`student_id` text,
	`source` text,
	`occurred_at_ms` integer,
	`payload_json` text
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`legacy_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`student_id` text,
	`student_name_snapshot` text,
	`visitor_name` text,
	`relation` text,
	`room_text` text,
	`dorm_block_text` text,
	`source` text,
	`device_id` text,
	`rfid_uid` text,
	`is_unlinked` integer DEFAULT false NOT NULL,
	`visit_at` text,
	`visit_at_ms` integer,
	`status` text
);
