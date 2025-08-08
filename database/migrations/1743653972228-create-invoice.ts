/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateInvoice1743653972228 implements MigrationInterface {
  name = 'CreateInvoice1743653972228'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" BIGSERIAL NOT NULL, "total_amount" numeric(10,2) NOT NULL, "status" smallint NOT NULL DEFAULT '1', "issued_date" TIMESTAMP NOT NULL DEFAULT now(), "due_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "appointment_id" bigint NOT NULL, "provider_id" bigint NOT NULL, "client_id" bigint NOT NULL, CONSTRAINT "REL_70757267b44d3b26bd88966908" UNIQUE ("appointment_id"), CONSTRAINT "PK_invoices_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_invoices_client_id" ON "invoices" ("client_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_invoices_provider_id" ON "invoices" ("provider_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_70757267b44d3b26bd88966908b" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_8cab41f81fdc5629bfc92f1bdaf" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_5534ba11e10f1a9953cbdaabf16" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_5534ba11e10f1a9953cbdaabf16"`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_8cab41f81fdc5629bfc92f1bdaf"`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_70757267b44d3b26bd88966908b"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_invoices_provider_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_invoices_client_id"`)
    await queryRunner.query(`DROP TABLE "invoices"`)
  }
}
