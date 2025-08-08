/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProvider1743653064235 implements MigrationInterface {
  name = 'CreateProvider1743653064235'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "providers" ("id" BIGSERIAL NOT NULL, "business_name" varchar(255) NOT NULL, "description" text, "rating" numeric(2,1) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint NOT NULL, CONSTRAINT "REL_842a46f6b0079a69520561eeb6" UNIQUE ("user_id"), CONSTRAINT "PK_providers_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_providers_business_name" ON "providers" ("business_name") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_providers_user_id" ON "providers" ("user_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_842a46f6b0079a69520561eeb62" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_842a46f6b0079a69520561eeb62"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_providers_user_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_providers_business_name"`)
    await queryRunner.query(`DROP TABLE "providers"`)
  }
}
