<?php

namespace App\Services;

use Throwable;

class AiTraceService
{
    /** @param array<string, mixed> $data */
    public function trace(string $stage, array $data = []): void
    {
        error_log($this->line($stage, $data));
    }

    /** @param array<string, mixed> $data */
    public function line(string $stage, array $data = []): string
    {
        $payload = $this->sanitize($data);
        $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR);

        return '[AI_TRACE]['.$stage.'] '.($json ?: '{}');
    }

    private function sanitize(mixed $value, ?string $key = null): mixed
    {
        if ($this->isSensitiveKey($key)) {
            return '[REDACTED]';
        }

        if ($value instanceof Throwable) {
            return [
                'type' => $value::class,
                'message' => $value->getMessage(),
                'trace' => $value->getTraceAsString(),
            ];
        }

        if (is_array($value)) {
            $sanitized = [];
            foreach ($value as $childKey => $childValue) {
                $sanitized[$childKey] = $this->sanitize($childValue, (string) $childKey);
            }

            return $sanitized;
        }

        if (is_object($value)) {
            return $this->sanitize((array) $value, $key);
        }

        return $value;
    }

    private function isSensitiveKey(?string $key): bool
    {
        return $key !== null && preg_match('/password|token|secret|api[_-]?key|authorization|cookie|credential/i', $key) === 1;
    }
}
