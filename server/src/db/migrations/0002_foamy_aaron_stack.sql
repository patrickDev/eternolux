CREATE TABLE `sell_summaries` (
	`sell_summary_id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`total_revenue` text DEFAULT '0.00' NOT NULL,
	`total_orders` integer DEFAULT 0 NOT NULL,
	`total_products_sold` integer DEFAULT 0 NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
