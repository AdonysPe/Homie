CREATE TABLE "adoption_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"adopter_id" text NOT NULL,
	"adopter_name" text NOT NULL,
	"adopter_city" text NOT NULL,
	"home_type" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"contact_shared_at" timestamp with time zone,
	"is_read_by_owner" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "success_stories" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"adopter_id" text,
	"photo" text NOT NULL,
	"photo_alt" text NOT NULL,
	"testimonial" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "success_stories_pet_id_unique" UNIQUE("pet_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_adopter_id_user_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_request_id_adoption_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."adoption_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_stories" ADD CONSTRAINT "success_stories_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_stories" ADD CONSTRAINT "success_stories_adopter_id_user_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "adoption_requests_pet_adopter_idx" ON "adoption_requests" USING btree ("pet_id","adopter_id");--> statement-breakpoint
CREATE INDEX "adoption_requests_owner_idx" ON "adoption_requests" USING btree ("owner_id","last_activity_at");--> statement-breakpoint
CREATE INDEX "adoption_requests_adopter_idx" ON "adoption_requests" USING btree ("adopter_id","last_activity_at");--> statement-breakpoint
CREATE INDEX "messages_request_idx" ON "messages" USING btree ("request_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_receiver_unread_idx" ON "messages" USING btree ("receiver_id","is_read");--> statement-breakpoint
CREATE INDEX "messages_sender_created_idx" ON "messages" USING btree ("sender_id","created_at");--> statement-breakpoint
CREATE INDEX "success_stories_adopter_idx" ON "success_stories" USING btree ("adopter_id");