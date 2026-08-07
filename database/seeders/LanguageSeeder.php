<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'script_dir' => 'ltr', 'is_default' => true],
            ['code' => 'ar', 'name' => 'Arabic', 'native_name' => 'العربية', 'script_dir' => 'rtl', 'is_default' => false],
            ['code' => 'bn', 'name' => 'Bengali', 'native_name' => 'বাংলা', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'hi', 'name' => 'Hindi', 'native_name' => 'हिन्दी', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ur', 'name' => 'Urdu', 'native_name' => 'اردو', 'script_dir' => 'rtl', 'is_default' => false],
            ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Español', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'fr', 'name' => 'French', 'native_name' => 'Français', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'de', 'name' => 'German', 'native_name' => 'Deutsch', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'pt', 'name' => 'Portuguese', 'native_name' => 'Português', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'it', 'name' => 'Italian', 'native_name' => 'Italiano', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'nl', 'name' => 'Dutch', 'native_name' => 'Nederlands', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'tr', 'name' => 'Turkish', 'native_name' => 'Türkçe', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ru', 'name' => 'Russian', 'native_name' => 'Русский', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'zh-CN', 'name' => 'Chinese (Simplified)', 'native_name' => '简体中文', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'zh-TW', 'name' => 'Chinese (Traditional)', 'native_name' => '繁體中文', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ja', 'name' => 'Japanese', 'native_name' => '日本語', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ko', 'name' => 'Korean', 'native_name' => '한국어', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'th', 'name' => 'Thai', 'native_name' => 'ไทย', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'vi', 'name' => 'Vietnamese', 'native_name' => 'Tiếng Việt', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'id', 'name' => 'Indonesian', 'native_name' => 'Bahasa Indonesia', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ms', 'name' => 'Malay', 'native_name' => 'Bahasa Melayu', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'fa', 'name' => 'Persian', 'native_name' => 'فارسی', 'script_dir' => 'rtl', 'is_default' => false],
            ['code' => 'he', 'name' => 'Hebrew', 'native_name' => 'עברית', 'script_dir' => 'rtl', 'is_default' => false],
            ['code' => 'pl', 'name' => 'Polish', 'native_name' => 'Polski', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'cs', 'name' => 'Czech', 'native_name' => 'Čeština', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ro', 'name' => 'Romanian', 'native_name' => 'Română', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'el', 'name' => 'Greek', 'native_name' => 'Ελληνικά', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'sv', 'name' => 'Swedish', 'native_name' => 'Svenska', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'no', 'name' => 'Norwegian', 'native_name' => 'Norsk', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'da', 'name' => 'Danish', 'native_name' => 'Dansk', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'fi', 'name' => 'Finnish', 'native_name' => 'Suomi', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'hu', 'name' => 'Hungarian', 'native_name' => 'Magyar', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'uk', 'name' => 'Ukrainian', 'native_name' => 'Українська', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ta', 'name' => 'Tamil', 'native_name' => 'தமிழ்', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'te', 'name' => 'Telugu', 'native_name' => 'తెలుగు', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'kn', 'name' => 'Kannada', 'native_name' => 'ಕನ್ನಡ', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ml', 'name' => 'Malayalam', 'native_name' => 'മലയാളം', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'mr', 'name' => 'Marathi', 'native_name' => 'मराठी', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'gu', 'name' => 'Gujarati', 'native_name' => 'ગુજરાતી', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'pa', 'name' => 'Punjabi', 'native_name' => 'ਪੰਜਾਬੀ', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'si', 'name' => 'Sinhala', 'native_name' => 'සිංහල', 'script_dir' => 'ltr', 'is_default' => false],
            ['code' => 'ne', 'name' => 'Nepali', 'native_name' => 'नेपाली', 'script_dir' => 'ltr', 'is_default' => false],
        ];

        foreach ($languages as $lang) {
            Language::updateOrCreate(['code' => $lang['code']], $lang);
        }
    }
}
