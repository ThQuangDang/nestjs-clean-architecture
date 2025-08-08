/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateClient1743653312795 implements MigrationInterface {
  name = 'CreateClient1743653312795'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint NOT NULL, CONSTRAINT "REL_07a7a09b04e7b035c9d90cf498" UNIQUE ("user_id"), CONSTRAINT "PK_clients_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984"`,
    )
    await queryRunner.query(`DROP TABLE "clients"`)
  }
}
