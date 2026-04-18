ALTER TABLE `tenant_settings` ADD `current_plan` text;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `subscription_status` text;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `enabled_modules_json` text;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `enabled_features_json` text;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `role_scopes_json` text;