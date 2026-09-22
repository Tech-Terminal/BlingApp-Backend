import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1784296334592 implements MigrationInterface {
    name = 'Init1784296334592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" DROP CONSTRAINT "FK_base_ingredient"`);
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" DROP CONSTRAINT "FK_target_ingredient"`);
        await queryRunner.query(`ALTER TABLE "active_ingredients" DROP COLUMN "interactions"`);
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" ADD CONSTRAINT "FK_94e9dcfe993628ccbb51b950933" FOREIGN KEY ("baseIngredientId") REFERENCES "active_ingredients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" ADD CONSTRAINT "FK_cb136260f7b0b50b2b1fdcf05b1" FOREIGN KEY ("targetIngredientId") REFERENCES "active_ingredients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" DROP CONSTRAINT "FK_cb136260f7b0b50b2b1fdcf05b1"`);
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" DROP CONSTRAINT "FK_94e9dcfe993628ccbb51b950933"`);
        await queryRunner.query(`ALTER TABLE "active_ingredients" ADD "interactions" jsonb`);
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" ADD CONSTRAINT "FK_target_ingredient" FOREIGN KEY ("targetIngredientId") REFERENCES "active_ingredients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_ingredient_interactions" ADD CONSTRAINT "FK_base_ingredient" FOREIGN KEY ("baseIngredientId") REFERENCES "active_ingredients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
