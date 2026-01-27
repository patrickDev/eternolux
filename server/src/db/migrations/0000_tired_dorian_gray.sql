CREATE TABLE `admin_actions` (
	`admin_action_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`admin_id` text NOT NULL,
	`action_type` text NOT NULL,
	`details` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `admin_actions_admin_id_idx` ON `admin_actions` (`admin_id`);--> statement-breakpoint
CREATE INDEX `admin_actions_action_type_idx` ON `admin_actions` (`action_type`);--> statement-breakpoint
CREATE TABLE `cart_items` (
	`cart_item_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`cart_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`cart_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cart_items_cart_id_idx` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE INDEX `cart_items_product_id_idx` ON `cart_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `carts` (
	`cart_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `carts_user_id_unique` ON `carts` (`user_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`category_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_item_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_product_id_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `order_summaries` (
	`order_summary_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`total_orders` integer DEFAULT 0 NOT NULL,
	`total_spent` text DEFAULT '0.00' NOT NULL,
	`last_order_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_summaries_user_id_unique` ON `order_summaries` (`user_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`order_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`shipping_address_id` text,
	`status` text DEFAULT 'Pending' NOT NULL,
	`total_price` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shipping_address_id`) REFERENCES `shipping_addresses`(`shipping_address_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_shipping_address_id_idx` ON `orders` (`shipping_address_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`product_id`, `category_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_categories_product_id_idx` ON `product_categories` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_categories_category_id_idx` ON `product_categories` (`category_id`);--> statement-breakpoint
CREATE TABLE `product_summaries` (
	`product_summary_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`product_id` text NOT NULL,
	`total_sold` integer DEFAULT 0 NOT NULL,
	`total_revenue` text DEFAULT '0.00' NOT NULL,
	`last_sold_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_summaries_product_id_unique` ON `product_summaries` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`product_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` text NOT NULL,
	`stock` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`image_url` text,
	`rating` real
);
--> statement-breakpoint
CREATE TABLE `sell_by_categories` (
	`sell_by_category_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`category_id` text NOT NULL,
	`total_revenue` text DEFAULT '0.00' NOT NULL,
	`total_products_sold` integer DEFAULT 0 NOT NULL,
	`last_sold_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sell_by_categories_category_id_unique` ON `sell_by_categories` (`category_id`);--> statement-breakpoint
CREATE TABLE `sell_summaries` (
	`sell_summary_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`total_revenue` text DEFAULT '0.00' NOT NULL,
	`total_orders` integer DEFAULT 0 NOT NULL,
	`total_products_sold` integer DEFAULT 0 NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shipping_addresses` (
	`shipping_address_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip_code` text NOT NULL,
	`country` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shipping_addresses_user_id_idx` ON `shipping_addresses` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);