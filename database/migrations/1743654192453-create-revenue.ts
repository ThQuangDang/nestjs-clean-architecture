/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateRevenue1743654192453 implements MigrationInterface {
  name = 'CreateRevenue1743654192453'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "revenues" ("id" BIGSERIAL NOT NULL, "total_income" numeric(10,2) NOT NULL, "commission" numeric(10,2) NOT NULL, "net_income" numeric(10,2) NOT NULL, "month" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "provider_id" bigint NOT NULL, CONSTRAINT "PK_revenues_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_revenues_provider_month" ON "revenues" ("provider_id", "month") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_revenues_month" ON "revenues" ("month") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_revenues_provider_id" ON "revenues" ("provider_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "revenues" ADD CONSTRAINT "FK_a504f2817b24975c69a5673a99a" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "revenues" DROP CONSTRAINT "FK_a504f2817b24975c69a5673a99a"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_revenues_provider_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_revenues_month"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_revenues_provider_month"`)
    await queryRunner.query(`DROP TABLE "revenues"`)
  }
}
