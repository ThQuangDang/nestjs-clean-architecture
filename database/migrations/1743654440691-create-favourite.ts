/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateFavourite1743654440691 implements MigrationInterface {
  name = 'CreateFavourite1743654440691'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "favourites" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" bigint NOT NULL, "service_id" bigint NOT NULL, CONSTRAINT "PK_favourites_id" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_favourites_client_srevice" ON "favourites" ("client_id", "service_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_favourites_serivce" ON "favourites" ("service_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_favourites_client" ON "favourites" ("client_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_c87b6dbeccdf744d04cf77c594b" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_b6ac60a101c5e3a27e2750dee77" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_b6ac60a101c5e3a27e2750dee77"`,
    )
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_c87b6dbeccdf744d04cf77c594b"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_favourites_client"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_favourites_serivce"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_favourites_client_srevice"`,
    )
    await queryRunner.query(`DROP TABLE "favourites"`)
  }
}
