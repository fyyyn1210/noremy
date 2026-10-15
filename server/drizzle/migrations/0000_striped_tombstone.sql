CREATE TABLE "freelance_works" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"year" varchar(255) NOT NULL,
	"client" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"gradient" varchar(255) NOT NULL,
	"tags" jsonb NOT NULL,
	"image" varchar(255) NOT NULL,
	"brand_bg" varchar(255) NOT NULL,
	"brand_char" varchar(10) NOT NULL,
	"overview" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"scope" jsonb NOT NULL,
	"discover_url" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "freelance_works_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"start" varchar(255) NOT NULL,
	"end" varchar(255) NOT NULL,
	"logo_url" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"issuer" varchar(255) NOT NULL,
	"href" varchar(255) NOT NULL,
	"dates" varchar(255) NOT NULL,
	"logo_url" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "educations" (
	"id" serial PRIMARY KEY NOT NULL,
	"school" varchar(255) NOT NULL,
	"href" varchar(255) NOT NULL,
	"degree" varchar(255) NOT NULL,
	"logo_url" varchar(255) NOT NULL,
	"start" varchar(255) NOT NULL,
	"end" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" jsonb NOT NULL,
	"answer" jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_review_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(64) NOT NULL,
	"label" varchar(255) DEFAULT '' NOT NULL,
	"expires_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	"testimonial_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "freelance_review_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "freelance_service_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" varchar(255),
	"description" jsonb NOT NULL,
	"features" jsonb NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" jsonb NOT NULL,
	"tagline" jsonb NOT NULL,
	"category" varchar(255) NOT NULL,
	"brand_bg" varchar(255) NOT NULL,
	"brand_char" varchar(10) NOT NULL,
	"brand_img" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "freelance_services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "freelance_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar(255) NOT NULL,
	"label" jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote" jsonb NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"source" varchar(16) DEFAULT 'admin' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(255) NOT NULL,
	"href" varchar(255) NOT NULL,
	"badges" jsonb NOT NULL,
	"location" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"logo_url" varchar(255) NOT NULL,
	"start" varchar(255) NOT NULL,
	"end" varchar(255),
	"description" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255) NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon_slug" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	"href" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" jsonb NOT NULL,
	"href" varchar(255) NOT NULL,
	"dates" varchar(255) NOT NULL,
	"active" boolean NOT NULL,
	"description" jsonb NOT NULL,
	"content" jsonb NOT NULL,
	"technologies" jsonb NOT NULL,
	"scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" varchar(255) NOT NULL,
	"kind" varchar(255) NOT NULL,
	"category" varchar(255),
	"company" varchar(255),
	"role" varchar(255),
	"logo_url" varchar(255),
	"gradient" varchar(255),
	"brand_bg" varchar(255),
	"brand_char" varchar(10),
	"visibility" jsonb DEFAULT '["portfolio"]'::jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"show_in_cv" boolean DEFAULT false NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"published_at" varchar(255) NOT NULL,
	"updated_at" varchar(255),
	"author" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"image" varchar(255) NOT NULL,
	"language" varchar(10) NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "freelance_review_invites" ADD CONSTRAINT "freelance_review_invites_testimonial_id_freelance_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."freelance_testimonials"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_service_packages" ADD CONSTRAINT "freelance_service_packages_service_id_freelance_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."freelance_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_items" ADD CONSTRAINT "skill_items_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_links" ADD CONSTRAINT "project_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;