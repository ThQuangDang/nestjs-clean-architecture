/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUser1743652728990 implements MigrationInterface {
  name = 'CreateUser1743652728990'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "user_name" varchar(225) NOT NULL, "email" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "last_login" TIMESTAMP, "role" smallint NOT NULL, "status" smallint NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_user_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_username" ON "users" ("user_name") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role" ON "users" ("role") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email") `,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_users_username"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
