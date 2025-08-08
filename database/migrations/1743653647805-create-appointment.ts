/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAppointment1743653647805 implements MigrationInterface {
  name = 'CreateAppointment1743653647805'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" BIGSERIAL NOT NULL, "appointment_time" TIMESTAMP NOT NULL, "status" smallint NOT NULL DEFAULT '1', "payment_status" smallint NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" bigint NOT NULL, "provider_id" bigint NOT NULL, "service_id" bigint NOT NULL, CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_time" ON "appointments" ("appointment_time") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_service_id" ON "appointments" ("service_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_provider_id" ON "appointments" ("provider_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_client_id" ON "appointments" ("client_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_ccc5bbce58ad6bc96faa428b1e4" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_e3e268ed1125872144e68b9a41c" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857"`,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_e3e268ed1125872144e68b9a41c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_ccc5bbce58ad6bc96faa428b1e4"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_appointments_client_id"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_appointments_provider_id"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_appointments_service_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_appointments_time"`)
    await queryRunner.query(`DROP TABLE "appointments"`)
  }
}
