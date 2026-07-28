<?php

namespace Database\Seeders;

use App\Enums\FeeProgram;
use App\Models\FeeCatalogItem;
use Illuminate\Database\Seeder;

/**
 * Seeds the normalized fee catalog from the legacy per-grade fee sheets.
 *
 * Cleaning applied vs. the legacy tables:
 * - Every AR#_X / X_Fee column pair becomes one catalog row.
 * - Graduation Fee existed in both the Graduation and Grade 12 sheets; it is
 *   kept only under the Graduation program to avoid double billing.
 * - Japanese Language (taken after Grade 12) is a first-class program; its
 *   fee items can be added from the Fee Catalog UI.
 */
class FeeCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Graduation program (from the Graduation Fee sheet)
            [FeeProgram::Graduation, 'pictorial', 'Pictorial Fee', 'fee'],
            [FeeProgram::Graduation, 'toga', 'Toga Fee', 'fee'],
            [FeeProgram::Graduation, 'graduation', 'Graduation Fee', 'fee'],
            [FeeProgram::Graduation, 'souvenir', 'Souvenir Fee', 'fee'],
            [FeeProgram::Graduation, 'recollection', 'Recollection Fee', 'fee'],
            [FeeProgram::Graduation, 'graduation_ball', 'Graduation Ball Fee', 'fee'],
            [FeeProgram::Graduation, 'career_guidance', 'Career Guidance Fee', 'fee'],

            // Grade 11 program (from the Grade 11 Fee sheet)
            [FeeProgram::Grade11, 'id', 'ID Fee', 'fee'],
            [FeeProgram::Grade11, 'uniform', 'Uniform Fee', 'fee'],
            [FeeProgram::Grade11, 'test_paper_term_1', 'Test Paper — Term 1', 'test_paper'],
            [FeeProgram::Grade11, 'test_paper_term_2', 'Test Paper — Term 2', 'test_paper'],
            [FeeProgram::Grade11, 'test_paper_term_3', 'Test Paper — Term 3', 'test_paper'],
            [FeeProgram::Grade11, 'cmmaw_month_1', 'CMMAW Consumables — Month 1', 'consumable'],
            [FeeProgram::Grade11, 'cmmaw_month_2', 'CMMAW Consumables — Month 2', 'consumable'],
            [FeeProgram::Grade11, 'cmmaw_month_3', 'CMMAW Consumables — Month 3', 'consumable'],
            [FeeProgram::Grade11, 'caregiving_month_1', 'Caregiving Consumables — Month 1', 'consumable'],
            [FeeProgram::Grade11, 'caregiving_month_2', 'Caregiving Consumables — Month 2', 'consumable'],
            [FeeProgram::Grade11, 'caregiving_month_3', 'Caregiving Consumables — Month 3', 'consumable'],
            [FeeProgram::Grade11, 'bakery_month_1', 'Bakery Consumables — Month 1', 'consumable'],
            [FeeProgram::Grade11, 'bakery_month_2', 'Bakery Consumables — Month 2', 'consumable'],
            [FeeProgram::Grade11, 'bakery_month_3', 'Bakery Consumables — Month 3', 'consumable'],

            // Grade 12 program (from the Grade 12 Fee sheet; Graduation Fee
            // deliberately excluded — it is billed under the Graduation program)
            [FeeProgram::Grade12, 'test_paper_term_1', 'Test Paper — Term 1', 'test_paper'],
            [FeeProgram::Grade12, 'test_paper_term_2', 'Test Paper — Term 2', 'test_paper'],
            [FeeProgram::Grade12, 'test_paper_term_3', 'Test Paper — Term 3', 'test_paper'],
            [FeeProgram::Grade12, 'mmaw_month_1', 'MMAW Consumables — Month 1', 'consumable'],
            [FeeProgram::Grade12, 'mmaw_month_2', 'MMAW Consumables — Month 2', 'consumable'],
            [FeeProgram::Grade12, 'mmaw_month_3', 'MMAW Consumables — Month 3', 'consumable'],
            [FeeProgram::Grade12, 'caregiving_month_1', 'Caregiving Consumables — Month 1', 'consumable'],
            [FeeProgram::Grade12, 'caregiving_month_2', 'Caregiving Consumables — Month 2', 'consumable'],
            [FeeProgram::Grade12, 'caregiving_month_3', 'Caregiving Consumables — Month 3', 'consumable'],
            [FeeProgram::Grade12, 'he_cookery_month_1', 'HE Cookery Consumables — Month 1', 'consumable'],
            [FeeProgram::Grade12, 'he_cookery_month_2', 'HE Cookery Consumables — Month 2', 'consumable'],
            [FeeProgram::Grade12, 'he_cookery_month_3', 'HE Cookery Consumables — Month 3', 'consumable'],
        ];

        $sortPerProgram = [];

        foreach ($items as [$program, $code, $label, $category]) {
            $sortPerProgram[$program->value] = ($sortPerProgram[$program->value] ?? 0) + 1;

            FeeCatalogItem::withTrashed()->updateOrCreate(
                ['program' => $program->value, 'code' => $code],
                [
                    'label' => $label,
                    'category' => $category,
                    'sort_order' => $sortPerProgram[$program->value] * 10,
                    'is_active' => true,
                    'deleted_at' => null,
                ]
            );
        }
    }
}
