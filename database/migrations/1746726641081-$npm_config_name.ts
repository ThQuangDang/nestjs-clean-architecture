/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class $npmConfigName1746726641081 implements MigrationInterface {
  name = ' $npmConfigName1746726641081'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_fkey"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_reviews_provider_service"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "status" smallint NOT NULL DEFAULT '1'`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "appointment_id" bigint NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "UQ_b0355254b748096d3e4d9a9ac2b" UNIQUE ("appointment_id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "services" ADD "rating" numeric(2,1) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_reviews_appointment_id" ON "reviews" ("appointment_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_b0355254b748096d3e4d9a9ac2b" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_563a5e248518c623eebd987d43e" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_563a5e248518c623eebd987d43e"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_b0355254b748096d3e4d9a9ac2b"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_appointment_id"`)
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "rating"`)
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "UQ_b0355254b748096d3e4d9a9ac2b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "appointment_id"`,
    )
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "status"`)
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_provider_service" ON "reviews" ("provider_id", "service_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }
}
