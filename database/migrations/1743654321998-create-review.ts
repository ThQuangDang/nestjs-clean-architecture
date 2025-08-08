/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateReview1743654321998 implements MigrationInterface {
  name = 'CreateReview1743654321998'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" BIGSERIAL NOT NULL, "rating" numeric(2,1) NOT NULL, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" bigint NOT NULL, "provider_id" bigint NOT NULL, "service_id" bigint NOT NULL, CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_provider_service" ON "reviews" ("provider_id", "service_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_service_id" ON "reviews" ("service_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_provider_id" ON "reviews" ("provider_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_client_id" ON "reviews" ("client_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_d4e7e923e6bb78a8f0add754493" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_ba7ceb19946b8b23bf5939c930f" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_6587db79174d07150fde1f1a4d6" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_6587db79174d07150fde1f1a4d6"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_ba7ceb19946b8b23bf5939c930f"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_d4e7e923e6bb78a8f0add754493"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_client_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_provider_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_service_id"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_reviews_provider_service"`,
    )
    await queryRunner.query(`DROP TABLE "reviews"`)
  }
}
