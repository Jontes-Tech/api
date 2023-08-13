CREATE TABLE IF NOT EXISTS "magic_links" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" bigint NOT NULL
);
