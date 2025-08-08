/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateNotification1743654559306 implements MigrationInterface {
  name = 'CreateNotification1743654559306'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" BIGSERIAL NOT NULL, "type" smallint NOT NULL DEFAULT '2', "title" varchar(255) NOT NULL, "message" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint NOT NULL, CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_type" ON "notifications" ("type") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_user_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_type"`)
    await queryRunner.query(`DROP TABLE "notifications"`)
  }
}
