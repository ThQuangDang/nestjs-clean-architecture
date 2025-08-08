/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateChat1743656128989 implements MigrationInterface {
  name = 'CreateChat1743656128989'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chats" ("id" BIGSERIAL NOT NULL, "message" text, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "sender_id" bigint NOT NULL, "receiver_id" bigint NOT NULL, CONSTRAINT "PK_chats_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_chats_sender_receiver" ON "chats" ("sender_id", "receiver_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_chats_receiver_id" ON "chats" ("receiver_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_chats_sender_id" ON "chats" ("sender_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_ed49245ae87902459011243d69a" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_543183a92a0aa5ae2851b69913c" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_543183a92a0aa5ae2851b69913c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_ed49245ae87902459011243d69a"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_chats_sender_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_chats_receiver_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_chats_sender_receiver"`)
    await queryRunner.query(`DROP TABLE "chats"`)
  }
}
