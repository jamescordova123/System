<?php

namespace App\Enums;

enum FeeProgram: string
{
    case Grade11 = 'grade_11';
    case Grade12 = 'grade_12';
    case Graduation = 'graduation';
    case JapaneseLanguage = 'japanese_language';

    public function label(): string
    {
        return match ($this) {
            self::Grade11 => 'Grade 11',
            self::Grade12 => 'Grade 12',
            self::Graduation => 'Graduation',
            self::JapaneseLanguage => 'Japanese Language',
        };
    }
}
