/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePayment1743653805247 implements MigrationInterface {
  name = 'CreatePayment1743653805247'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" BIGSERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "status" smallint NOT NULL DEFAULT '1', "payment_method" smallint NOT NULL DEFAULT '1', "transaction_id" varchar(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "appointment_id" bigint NOT NULL, "client_id" bigint NOT NULL, "provider_id" bigint NOT NULL, CONSTRAINT "UQ_3c324ca49dabde7ffc0ef64675d" UNIQUE ("transaction_id"), CONSTRAINT "REL_9f49987820da519f855d04c82b" UNIQUE ("appointment_id"), CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_payments_transaction_id" ON "payments" ("transaction_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_provider_id" ON "payments" ("provider_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_client_id" ON "payments" ("client_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_9f49987820da519f855d04c82bd" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_bce3f30c3460065a6aeca163258" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_e92b64ae70df3f2453392dc44fd" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_e92b64ae70df3f2453392dc44fd"`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_bce3f30c3460065a6aeca163258"`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_9f49987820da519f855d04c82bd"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_payments_client_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_payments_provider_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_payments_transaction_id"`)
    await queryRunner.query(`DROP TABLE "payments"`)
  }
}
