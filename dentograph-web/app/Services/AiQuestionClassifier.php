<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class AiQuestionClassifier
{
    public function __construct(private readonly AiTraceService $trace) {}

    /** @return array{intent: string, patient_name: ?string, radiograph_id: ?string} */
    public function classify(User $user, string $question): array
    {
        $this->trace->trace('CLASSIFIER][START', [
            'user_id' => $user->id,
            'role' => $user->role,
            'question' => $question,
        ]);

        $this->trace->trace('CLASSIFIER][RADIOGRAPH_CHECK', ['question' => $question]);
        if (preg_match('/\bRAD-[A-Z0-9-]+\b/i', $question, $match) === 1) {
            return $this->tracedResult('radiograph', radiographId: Str::upper($match[0]));
        }

        $normalized = Str::lower($question);
        $this->trace->trace('CLASSIFIER][SELF_CLINICAL_CHECK', [
            'role' => $user->role,
            'normalized_question' => $normalized,
        ]);
        if ($user->role === 'pasien' && Str::contains($normalized, [
            'gigi saya',
            'kondisi saya',
            'radiograf saya',
            'hasil saya',
            'hasil pemeriksaan saya',
        ])) {
            return $this->tracedResult('self_clinical');
        }

        $this->trace->trace('CLASSIFIER][PATIENT_NAME_CHECK', ['question' => $question]);
        if (preg_match('/\b(?:pasien|patient)\s+(?:bernama\s+)?(.+?)(?=\s+(?:saat\s+ini|sekarang|bagaimana|gimana|yang|dengan|memiliki|mengalami)\b|[?.!,]|$)/iu', $question, $match) === 1) {
            $name = trim(preg_replace('/\s+/', ' ', $match[1]) ?? $match[1], " \t\n\r\0\x0B.,?!:;");
            $this->trace->trace('CLASSIFIER][PATIENT_NAME_EXTRACTED', ['patient_name' => $name]);

            if ($name !== '') {
                return $this->tracedResult('patient_name', patientName: $name);
            }
        }

        return $this->tracedResult('knowledge');
    }

    /** @return array{intent: string, patient_name: ?string, radiograph_id: ?string} */
    private function tracedResult(string $intent, ?string $patientName = null, ?string $radiographId = null): array
    {
        $result = [
            'intent' => $intent,
            'patient_name' => $patientName,
            'radiograph_id' => $radiographId,
        ];
        $this->trace->trace('CLASSIFIER][RESULT', $result);

        return $result;
    }
}
