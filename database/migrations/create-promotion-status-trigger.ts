/* eslint-disable import/named */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class XXXXXXXXXXXXXXCreatePromotionStatusTrigger
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_promotion_status_on_max_usage()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.use_count IS DISTINCT FROM OLD.use_count AND NEW.use_count = NEW.max_usage AND NEW.status != 2 THEN
                    NEW.status := 2;
                    RETURN NEW;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `)

    await queryRunner.query(`
            CREATE TRIGGER promotion_status_update_trigger
            BEFORE UPDATE ON promotions
            FOR EACH ROW
            EXECUTE FUNCTION update_promotion_status_on_max_usage();
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS promotion_status_update_trigger ON promotions;
        `)

    await queryRunner.query(`
            DROP FUNCTION IF EXISTS update_promotion_status_on_max_usage();
        `)
  }
}
