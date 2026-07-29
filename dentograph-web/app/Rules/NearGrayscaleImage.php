<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class NearGrayscaleImage implements ValidationRule
{
    private const MAX_SAMPLES = 10000;

    private const CHANNEL_TOLERANCE = 12;

    private const MAX_COLORED_RATIO = 0.01;

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            return;
        }

        $contents = file_get_contents($value->getRealPath());
        $image = $contents === false ? false : @imagecreatefromstring($contents);

        if ($image === false) {
            $fail('File radiograf harus berupa gambar yang valid dan dapat dibaca.');

            return;
        }

        try {
            if (! $this->isNearGrayscale($image)) {
                $fail('Radiograf harus berupa gambar hitam putih atau grayscale.');
            }
        } finally {
            imagedestroy($image);
        }
    }

    private function isNearGrayscale(\GdImage $image): bool
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $stride = max(1, (int) ceil(sqrt(($width * $height) / self::MAX_SAMPLES)));
        $samples = 0;
        $coloredSamples = 0;

        for ($y = 0; $y < $height; $y += $stride) {
            for ($x = 0; $x < $width; $x += $stride) {
                $color = imagecolorsforindex($image, imagecolorat($image, $x, $y));
                $channels = [$color['red'], $color['green'], $color['blue']];

                $samples++;

                if (max($channels) - min($channels) > self::CHANNEL_TOLERANCE) {
                    $coloredSamples++;
                }
            }
        }

        return $samples > 0
            && ($coloredSamples / $samples) <= self::MAX_COLORED_RATIO;
    }
}
