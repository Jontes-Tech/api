CREATE TABLE IF NOT EXISTS "comments" (
	"id" text PRIMARY KEY DEFAULT '63d4108f-02c1-43ea-945a-be532b18ad27' NOT NULL,
	"author_id" text NOT NULL,
	"text" text,
	"created" bigint NOT NULL,
	"replies" json DEFAULT '[]'::json NOT NULL,
	"post" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT '0900b455-8a68-48fa-8052-18b92826a987';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
