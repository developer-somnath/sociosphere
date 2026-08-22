<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class GenerateVapidKeys extends Command
{
    protected $signature = 'pwa:generate-vapid-keys';

    protected $description = 'Generate VAPID key pair for WebPush and write them to .env';

    public function handle(): int
    {
        if (!function_exists('openssl_pkey_new')) {
            $this->error('OpenSSL extension is required to generate VAPID keys.');
            return self::FAILURE;
        }

        $res = openssl_pkey_new([
            'curve_name' => 'prime256v1',
            'private_key_type' => OPENSSL_KEYTYPE_EC,
        ]);

        if ($res === false) {
            $this->error('Failed to generate EC key.');
            return self::FAILURE;
        }

        openssl_pkey_export($res, $privatePem);
        $details = openssl_pkey_get_details($res);
        $publicPem = $details['key'] ?? '';

        $privateKey = $this->pemToBase64($privatePem);
        $publicKey = $this->pemToBase64($publicPem);

        $this->writeEnv('VAPID_PUBLIC_KEY', $publicKey);
        $this->writeEnv('VAPID_PRIVATE_KEY', $privateKey);

        $this->info('VAPID keys generated and written to .env');
        $this->line("VAPID_PUBLIC_KEY={$publicKey}");
        $this->line("VAPID_PRIVATE_KEY={$privateKey}");

        return self::SUCCESS;
    }

    private function pemToBase64(string $pem): string
    {
        $clean = preg_replace('/-----BEGIN[^-]+-----/', '', $pem);
        $clean = preg_replace('/-----END[^-]+-----/', '', $clean);
        $clean = preg_replace('/\s+/', '', $clean);

        return base64_encode(base64_decode($clean));
    }

    private function writeEnv(string $key, string $value): void
    {
        $path = base_path('.env');
        if (!File::exists($path)) {
            return;
        }

        $content = File::get($path);
        if (preg_match("/^{$key}=/m", $content)) {
            $content = preg_replace("/^{$key}=.*$/m", "{$key}={$value}", $content);
        } else {
            $content .= "\n{$key}={$value}\n";
        }
        File::put($path, $content);

        // Keep the cached config in sync.
        if (File::exists(base_path('bootstrap/cache/config.php'))) {
            @unlink(base_path('bootstrap/cache/config.php'));
        }
    }
}
