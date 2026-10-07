DO $$ BEGIN
  CREATE TYPE "public"."user_status" AS ENUM('PENDIENTE', 'ACTIVO', 'INACTIVO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "email" TO "username";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE "users" ALTER COLUMN "username" TYPE varchar(160);
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "password_hash" text;
    UPDATE "users" SET "password_hash" = '$2a$12$placeholderunusablehashxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' WHERE "password_hash" IS NULL;
    ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'estado'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "estado" "user_status" DEFAULT 'PENDIENTE' NOT NULL;
    UPDATE "users" SET "estado" = CASE WHEN "activo" THEN 'ACTIVO'::"user_status" ELSE 'INACTIVO'::"user_status" END;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activation_token_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activation_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activation_used_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_used_at" timestamp with time zone;--> statement-breakpoint
UPDATE "users" SET "activated_at" = "created_at" WHERE "estado" = 'ACTIVO' AND "activated_at" IS NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" USING btree ("username");
