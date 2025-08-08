/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePromotionUsage1743655955018 implements MigrationInterface {
  name = 'CreatePromotionUsage1743655955018'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promotion_usage" ("id" BIGSERIAL NOT NULL, "used_at" TIMESTAMP NOT NULL DEFAULT now(), "promotion_id" bigint NOT NULL, "client_id" bigint NOT NULL, CONSTRAINT "PK_promotion_usage_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_promotion_usage_promotion_client" ON "promotion_usage" ("promotion_id", "client_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_promotion_usage_client_id" ON "promotion_usage" ("client_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_promotion_usage_promotion_id" ON "promotion_usage" ("promotion_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "promotion_usage" ADD CONSTRAINT "FK_51b1d9ae72d9343d0a27e6231d7" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotion_usage" ADD CONSTRAINT "FK_3401a65fbe55f6608307d3711e6" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotion_usage" DROP CONSTRAINT "FK_3401a65fbe55f6608307d3711e6"`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotion_usage" DROP CONSTRAINT "FK_51b1d9ae72d9343d0a27e6231d7"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_promotion_usage_promotion_id"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_promotion_usage_client_id"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_promotion_usage_promotion_client"`,
    )
    await queryRunner.query(`DROP TABLE "promotion_usage"`)
  }
}
