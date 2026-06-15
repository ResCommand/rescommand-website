-- CreateTable statements auto-generated from prisma/schema.prisma
-- CreateTable
CREATE TABLE `tenants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NULL,
    `businessType` VARCHAR(191) NOT NULL DEFAULT 'DONUT_SHOP',
    `plan` VARCHAR(191) NOT NULL DEFAULT 'STARTER',
    `stripe_customer_id` VARCHAR(191) NULL,
    `trial_ends_at` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `logo_url` VARCHAR(191) NULL,
    `primary_color` VARCHAR(191) NULL DEFAULT '#1A56DB',
    `settings` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tenants_slug_key`(`slug`),
    UNIQUE INDEX `tenants_domain_key`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `role` ENUM('EMPLOYEE', 'MANAGER', 'OWNER') NOT NULL DEFAULT 'EMPLOYEE',
    `invited_by` INTEGER NULL,
    `accepted_at` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tenant_users_tenant_id_user_id_key`(`tenant_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `stripe_subscription_id` VARCHAR(191) NOT NULL,
    `stripe_price_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `current_period_start` DATETIME(3) NOT NULL,
    `current_period_end` DATETIME(3) NOT NULL,
    `cancel_at_period_end` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tenant_subscriptions_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_categories` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#6B7280',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `employee_categories_tenant_id_name_key`(`tenant_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('EMPLOYEE', 'MANAGER', 'OWNER') NOT NULL DEFAULT 'EMPLOYEE',
    `phone` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `is_platform_admin` BOOLEAN NOT NULL DEFAULT false,
    `category_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('DONUT', 'DRINK', 'DOGEL', 'SANDWICH', 'OTHER') NOT NULL,
    `foh_boh` ENUM('FOH', 'BOH', 'BOTH') NOT NULL DEFAULT 'BOTH',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `cost` DOUBLE NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_ingredients` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `inventory_item_id` INTEGER NOT NULL,
    `quantity_used` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL DEFAULT 0,
    `payment_method` ENUM('CASH', 'CARD', 'OTHER') NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_lines` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` INTEGER NOT NULL,
    `product_id` INTEGER NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drink_logs` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `drink_type` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NULL,
    `milk_type` VARCHAR(191) NULL,
    `espresso_shots` INTEGER NOT NULL DEFAULT 0,
    `dial_setting` VARCHAR(191) NULL,
    `waste` INTEGER NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donut_logs` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NULL,
    `made` INTEGER NOT NULL DEFAULT 0,
    `sold` INTEGER NOT NULL DEFAULT 0,
    `wasted` INTEGER NOT NULL DEFAULT 0,
    `period` ENUM('AM', 'PM') NOT NULL DEFAULT 'AM',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendors` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `mainUse` VARCHAR(191) NULL,
    `cadence` VARCHAR(191) NULL,
    `contactInfo` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vendors_tenant_id_name_key`(`tenant_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('FOH', 'BOH', 'BOTH') NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `unit_cost` DOUBLE NOT NULL DEFAULT 0,
    `par_level` DOUBLE NOT NULL DEFAULT 0,
    `current_stock` DOUBLE NOT NULL DEFAULT 0,
    `min_stock` DOUBLE NOT NULL DEFAULT 0,
    `reorder_qty` DOUBLE NOT NULL DEFAULT 0,
    `supplier` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `vendor_id` INTEGER NULL,
    `pack_size` VARCHAR(191) NULL,
    `suggested_cadence` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `inventory_section` VARCHAR(191) NOT NULL DEFAULT 'kitchen_regular',
    `inventory_section_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_orders` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('DRAFT', 'ORDERED', 'RECEIVED', 'PARTIAL') NOT NULL DEFAULT 'DRAFT',
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `received_at` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_order_lines` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `inventory_item_id` INTEGER NOT NULL,
    `qty_ordered` DOUBLE NOT NULL DEFAULT 0,
    `qty_received` DOUBLE NOT NULL DEFAULT 0,
    `unit_cost` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_counts` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `counted_by` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inventory_counts_tenant_id_date_key`(`tenant_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_count_lines` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `count_id` INTEGER NOT NULL,
    `inventory_item_id` INTEGER NOT NULL,
    `on_hand` DOUBLE NOT NULL DEFAULT 0,
    `amount_to_order` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `inventory_count_lines_count_id_inventory_item_id_key`(`count_id`, `inventory_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_sections` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT '📦',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `inventory_sections_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_requests` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventory_item_id` INTEGER NULL,
    `qty_requested` DOUBLE NOT NULL DEFAULT 0,
    `requested_by` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'ORDERED', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `reviewed_by` INTEGER NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `custom_item_name` VARCHAR(191) NULL,
    `custom_vendor_name` VARCHAR(191) NULL,
    `custom_unit` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holiday_schedules` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `impact_level` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weather_cache` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `temp_high` DOUBLE NOT NULL DEFAULT 0,
    `temp_low` DOUBLE NOT NULL DEFAULT 0,
    `precipitation` DOUBLE NOT NULL DEFAULT 0,
    `conditions` VARCHAR(191) NULL,
    `fetched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `weather_cache_tenant_id_date_key`(`tenant_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `par_sheets` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `generated_by` INTEGER NULL,
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `par_sheets_tenant_id_date_key`(`tenant_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `par_sheet_lines` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `par_sheet_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `par_level` INTEGER NOT NULL DEFAULT 0,
    `on_hand` INTEGER NOT NULL DEFAULT 0,
    `to_make` INTEGER NOT NULL DEFAULT 0,
    `actual_sold` INTEGER NULL,
    `predicted` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prediction_models` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `day_of_week` INTEGER NOT NULL,
    `avg_sold` DOUBLE NOT NULL DEFAULT 0,
    `weather_factor` DOUBLE NOT NULL DEFAULT 1.0,
    `holiday_factor` DOUBLE NOT NULL DEFAULT 1.0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overboard_schedules` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETE') NOT NULL DEFAULT 'SCHEDULED',
    `name` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overboard_lines` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `overboard_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `quantity_sold` INTEGER NOT NULL DEFAULT 0,
    `unit_price` DOUBLE NOT NULL DEFAULT 0,
    `upcharge_price` DOUBLE NOT NULL DEFAULT 0,
    `upcharges_sold` INTEGER NOT NULL DEFAULT 0,
    `fillings` VARCHAR(191) NULL,
    `toppings` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cleaning_tasks` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    `assigned_to` INTEGER NULL,
    `location` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cleaning_logs` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `completed_by` INTEGER NOT NULL,
    `completed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_logs` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipment` VARCHAR(191) NOT NULL,
    `issue` VARCHAR(191) NOT NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `resolved_by` INTEGER NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_hours` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `clock_in` DATETIME(3) NOT NULL,
    `clock_out` DATETIME(3) NULL,
    `total_hours` DOUBLE NULL,
    `date` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sops` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('FOH', 'BOH', 'SAFETY', 'CLEANING', 'OPENING', 'CLOSING', 'GENERAL') NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `file_url` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dashboard_layouts` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `layout` MEDIUMTEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dashboard_layouts_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `espresso_dial_logs` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `grounds_weight` DOUBLE NULL,
    `grinder_coarseness` VARCHAR(191) NULL,
    `dispense_time` DOUBLE NULL,
    `pull_time` DOUBLE NULL,
    `shot_weight` DOUBLE NULL,
    `decaf_grounds_weight` DOUBLE NULL,
    `decaf_grinder_coarseness` VARCHAR(191) NULL,
    `decaf_dispense_time` DOUBLE NULL,
    `decaf_pull_time` DOUBLE NULL,
    `decaf_shot_weight` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_categories` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT '📋',
    `color` VARCHAR(191) NOT NULL DEFAULT '#F9FAFB',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `recipe_categories_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipes` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'general',
    `category_id` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `ingredients` JSON NOT NULL,
    `instructions` TEXT NULL,
    `yield` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_target_overrides` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `target` INTEGER NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `production_target_overrides_tenant_id_date_key`(`tenant_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch_completions` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `batch_index` INTEGER NOT NULL,
    `mixer_type` VARCHAR(191) NOT NULL,
    `completed_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `batch_completions_tenant_id_date_batch_index_key`(`tenant_id`, `date`, `batch_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tray_overrides` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `flavor` VARCHAR(191) NOT NULL,
    `trays` DOUBLE NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tray_overrides_tenant_id_date_flavor_key`(`tenant_id`, `date`, `flavor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prep_items` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `category_color` VARCHAR(191) NOT NULL DEFAULT '#F3F4F6',
    `amount` VARCHAR(191) NOT NULL,
    `shelf_life_hours` INTEGER NOT NULL DEFAULT 0,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `sent_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_reads` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notification_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `read_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notification_reads_notification_id_user_id_key`(`notification_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_recipients` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notification_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `notification_recipients_notification_id_user_id_key`(`notification_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shifts` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    `notes` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability_blocks` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_of_week` INTEGER NOT NULL,
    `start_time` VARCHAR(191) NULL,
    `end_time` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_off_requests` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `reviewed_by` INTEGER NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_templates` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Default Schedule',
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_shifts` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_of_week` INTEGER NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    `user_id` INTEGER NOT NULL,
    `template_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_configs` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module_key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `icon` VARCHAR(191) NOT NULL DEFAULT '',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `group` VARCHAR(191) NOT NULL DEFAULT 'operations',

    UNIQUE INDEX `module_configs_tenant_id_module_key_key`(`tenant_id`, `module_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `green_coffees` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `origin` VARCHAR(191) NULL,
    `farm` VARCHAR(191) NULL,
    `process` VARCHAR(191) NULL,
    `variety` VARCHAR(191) NULL,
    `elevation` VARCHAR(191) NULL,
    `grade` VARCHAR(191) NULL,
    `density` VARCHAR(191) NULL,
    `moisture` DOUBLE NULL,
    `bag_weight_kg` DOUBLE NOT NULL DEFAULT 60,
    `stock_kg` DOUBLE NOT NULL DEFAULT 0,
    `cost_per_kg` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roast_profiles` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `green_coffee_id` INTEGER NOT NULL,
    `target_weight_kg` DOUBLE NOT NULL,
    `charge_temp` DOUBLE NULL,
    `turn_around_point` DOUBLE NULL,
    `first_crack` DOUBLE NULL,
    `development_time` DOUBLE NULL,
    `drop_temp` DOUBLE NULL,
    `total_duration` DOUBLE NULL,
    `roast_level` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roast_logs` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `green_coffee_id` INTEGER NOT NULL,
    `profile_id` INTEGER NULL,
    `green_weight_kg` DOUBLE NOT NULL,
    `roasted_weight_kg` DOUBLE NOT NULL,
    `roast_level` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `charge_temp` DOUBLE NULL,
    `first_crack_time` DOUBLE NULL,
    `drop_temp` DOUBLE NULL,
    `total_duration` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `loss_percent` DOUBLE NULL,
    `batch_number` VARCHAR(191) NULL,
    `performed_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_tasks` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `due_date` DATETIME(3) NULL,
    `assigned_to` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_posts` (
    `tenant_id` INTEGER NOT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NOT NULL DEFAULT 'ALL',
    `post_date` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `media_url` VARCHAR(191) NULL,
    `link_url` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `approved_by` INTEGER NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_pricings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planKey` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `stripe_price_id` VARCHAR(191) NULL,
    `features` JSON NULL,
    `staff_limit` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plan_pricings_planKey_key`(`planKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tenant_users` ADD CONSTRAINT `tenant_users_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_users` ADD CONSTRAINT `tenant_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_users` ADD CONSTRAINT `tenant_users_invited_by_fkey` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_subscriptions` ADD CONSTRAINT `tenant_subscriptions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_categories` ADD CONSTRAINT `employee_categories_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `employee_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_ingredients` ADD CONSTRAINT `product_ingredients_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_ingredients` ADD CONSTRAINT `product_ingredients_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_ingredients` ADD CONSTRAINT `product_ingredients_inventory_item_id_fkey` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_lines` ADD CONSTRAINT `transaction_lines_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_lines` ADD CONSTRAINT `transaction_lines_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_lines` ADD CONSTRAINT `transaction_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drink_logs` ADD CONSTRAINT `drink_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drink_logs` ADD CONSTRAINT `drink_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donut_logs` ADD CONSTRAINT `donut_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donut_logs` ADD CONSTRAINT `donut_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donut_logs` ADD CONSTRAINT `donut_logs_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_inventory_section_id_fkey` FOREIGN KEY (`inventory_section_id`) REFERENCES `inventory_sections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_orders` ADD CONSTRAINT `inventory_orders_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_orders` ADD CONSTRAINT `inventory_orders_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_order_lines` ADD CONSTRAINT `inventory_order_lines_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_order_lines` ADD CONSTRAINT `inventory_order_lines_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `inventory_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_order_lines` ADD CONSTRAINT `inventory_order_lines_inventory_item_id_fkey` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_counts` ADD CONSTRAINT `inventory_counts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_counts` ADD CONSTRAINT `inventory_counts_counted_by_fkey` FOREIGN KEY (`counted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_count_lines` ADD CONSTRAINT `inventory_count_lines_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_count_lines` ADD CONSTRAINT `inventory_count_lines_count_id_fkey` FOREIGN KEY (`count_id`) REFERENCES `inventory_counts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_count_lines` ADD CONSTRAINT `inventory_count_lines_inventory_item_id_fkey` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_sections` ADD CONSTRAINT `inventory_sections_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_requests` ADD CONSTRAINT `order_requests_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_requests` ADD CONSTRAINT `order_requests_inventory_item_id_fkey` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_requests` ADD CONSTRAINT `order_requests_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_requests` ADD CONSTRAINT `order_requests_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `holiday_schedules` ADD CONSTRAINT `holiday_schedules_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weather_cache` ADD CONSTRAINT `weather_cache_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `par_sheets` ADD CONSTRAINT `par_sheets_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `par_sheet_lines` ADD CONSTRAINT `par_sheet_lines_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `par_sheet_lines` ADD CONSTRAINT `par_sheet_lines_par_sheet_id_fkey` FOREIGN KEY (`par_sheet_id`) REFERENCES `par_sheets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `par_sheet_lines` ADD CONSTRAINT `par_sheet_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prediction_models` ADD CONSTRAINT `prediction_models_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overboard_schedules` ADD CONSTRAINT `overboard_schedules_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overboard_lines` ADD CONSTRAINT `overboard_lines_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overboard_lines` ADD CONSTRAINT `overboard_lines_overboard_id_fkey` FOREIGN KEY (`overboard_id`) REFERENCES `overboard_schedules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overboard_lines` ADD CONSTRAINT `overboard_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cleaning_tasks` ADD CONSTRAINT `cleaning_tasks_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cleaning_logs` ADD CONSTRAINT `cleaning_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cleaning_logs` ADD CONSTRAINT `cleaning_logs_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `cleaning_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cleaning_logs` ADD CONSTRAINT `cleaning_logs_completed_by_fkey` FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_logs` ADD CONSTRAINT `maintenance_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_logs` ADD CONSTRAINT `maintenance_logs_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_logs` ADD CONSTRAINT `maintenance_logs_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_hours` ADD CONSTRAINT `employee_hours_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_hours` ADD CONSTRAINT `employee_hours_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sops` ADD CONSTRAINT `sops_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sops` ADD CONSTRAINT `sops_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sops` ADD CONSTRAINT `sops_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboard_layouts` ADD CONSTRAINT `dashboard_layouts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboard_layouts` ADD CONSTRAINT `dashboard_layouts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `espresso_dial_logs` ADD CONSTRAINT `espresso_dial_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `espresso_dial_logs` ADD CONSTRAINT `espresso_dial_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_categories` ADD CONSTRAINT `recipe_categories_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `recipe_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_target_overrides` ADD CONSTRAINT `production_target_overrides_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batch_completions` ADD CONSTRAINT `batch_completions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batch_completions` ADD CONSTRAINT `batch_completions_completed_by_fkey` FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tray_overrides` ADD CONSTRAINT `tray_overrides_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prep_items` ADD CONSTRAINT `prep_items_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_sent_by_fkey` FOREIGN KEY (`sent_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_reads` ADD CONSTRAINT `notification_reads_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_reads` ADD CONSTRAINT `notification_reads_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_reads` ADD CONSTRAINT `notification_reads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_recipients` ADD CONSTRAINT `notification_recipients_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_recipients` ADD CONSTRAINT `notification_recipients_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_recipients` ADD CONSTRAINT `notification_recipients_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability_blocks` ADD CONSTRAINT `availability_blocks_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability_blocks` ADD CONSTRAINT `availability_blocks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_off_requests` ADD CONSTRAINT `time_off_requests_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_off_requests` ADD CONSTRAINT `time_off_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_off_requests` ADD CONSTRAINT `time_off_requests_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_templates` ADD CONSTRAINT `schedule_templates_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_shifts` ADD CONSTRAINT `template_shifts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_shifts` ADD CONSTRAINT `template_shifts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_shifts` ADD CONSTRAINT `template_shifts_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `schedule_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_configs` ADD CONSTRAINT `module_configs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `green_coffees` ADD CONSTRAINT `green_coffees_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roast_profiles` ADD CONSTRAINT `roast_profiles_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roast_profiles` ADD CONSTRAINT `roast_profiles_green_coffee_id_fkey` FOREIGN KEY (`green_coffee_id`) REFERENCES `green_coffees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roast_logs` ADD CONSTRAINT `roast_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roast_logs` ADD CONSTRAINT `roast_logs_green_coffee_id_fkey` FOREIGN KEY (`green_coffee_id`) REFERENCES `green_coffees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roast_logs` ADD CONSTRAINT `roast_logs_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `roast_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roast_logs` ADD CONSTRAINT `roast_logs_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_tasks` ADD CONSTRAINT `menu_tasks_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_tasks` ADD CONSTRAINT `menu_tasks_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `overboard_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_tasks` ADD CONSTRAINT `menu_tasks_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_posts` ADD CONSTRAINT `social_posts_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.8.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
