CREATE TABLE IF NOT EXISTS "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"text" text NOT NULL,
	"created" bigint NOT NULL,
	"post" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"admin" boolean DEFAULT false,
	"first_name" varchar,
	"last_name" varchar,
	"email" text,
	"display_name" text,
	"hue" bigint,
	"passage_id" text,
	"updated" bigint
);
