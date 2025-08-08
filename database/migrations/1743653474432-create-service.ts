/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateService1743653474432 implements MigrationInterface {
  name = 'CreateService1743653474432'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" BIGSERIAL NOT NULL, "name" varchar(255) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "status" smallint NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "provider_id" bigint NOT NULL, CONSTRAINT "UQ_019d74f7abcdcb5a0113010cb03" UNIQUE ("name"), CONSTRAINT "PK_service_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_services_name" ON "services" ("name") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_services_provider_id" ON "services" ("provider_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_services_provider_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_services_name"`)
    await queryRunner.query(`DROP TABLE "services"`)
  }
}
