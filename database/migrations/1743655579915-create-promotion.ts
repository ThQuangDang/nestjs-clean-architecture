/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePromotion1743655579915 implements MigrationInterface {
  name = 'CreatePromotion1743655579915'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promotions" ("id" BIGSERIAL NOT NULL, "name" varchar(225) NOT NULL, "discount" numeric(5,2) NOT NULL, "discount_code" varchar(225) NOT NULL, "max_usage" integer NOT NULL, "use_count" integer NOT NULL DEFAULT '0', "start_date" date NOT NULL, "end_date" date NOT NULL, "status" smallint NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "provider_id" bigint NOT NULL, CONSTRAINT "UQ_312995ade8588ccbde3f9345fc6" UNIQUE ("discount_code"), CONSTRAINT "PK_promotions_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_promotions_provider_status" ON "promotions" ("provider_id", "status") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_promotions_discount_code" ON "promotions" ("discount_code") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_promotions_provider_id" ON "promotions" ("provider_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD CONSTRAINT "FK_b8bf09f33f17d4a36eda6b999b2" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP CONSTRAINT "FK_b8bf09f33f17d4a36eda6b999b2"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_promotions_provider_id"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_promotions_discount_code"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_promotions_provider_status"`,
    )
    await queryRunner.query(`DROP TABLE "promotions"`)
  }
}
