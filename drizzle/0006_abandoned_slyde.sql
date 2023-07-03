ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" SET DEFAULT '6d194168-61c0-423a-a75c-67ddc6343a98';--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'd407a8b2-f2ac-4798-a438-bfc34fa19571';--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN IF EXISTS "replies";