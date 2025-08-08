/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePromotionService1743655749973 implements MigrationInterface {
  name = 'CreatePromotionService1743655749973'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promotions_services" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "promotion_id" bigint NOT NULL, "service_id" bigint NOT NULL, CONSTRAINT "PK_promotions_services_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_promotions_service" ON "promotions_services" ("promotion_id", "service_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_service_id" ON "promotions_services" ("service_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_promotions_id" ON "promotions_services" ("promotion_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions_services" ADD CONSTRAINT "FK_f718507377508fa4d958971a329" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions_services" ADD CONSTRAINT "FK_f28fe9b83b2eb8e90882bd801de" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions_services" DROP CONSTRAINT "FK_f28fe9b83b2eb8e90882bd801de"`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions_services" DROP CONSTRAINT "FK_f718507377508fa4d958971a329"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_promotions_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_service_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_promotions_service"`)
    await queryRunner.query(`DROP TABLE "promotions_services"`)
  }
}
