<?php

use App\Services\AiTraceService;

it('formats terminal traces with a stage and redacts secrets', function () {
    $line = app(AiTraceService::class)->line('Laravel][REQUEST', [
        'question' => 'Apa itu impaksi?',
        'api_key' => 'secret-key',
        'nested' => ['authorization' => 'Bearer secret'],
    ]);

    expect($line)
        ->toContain('[AI_TRACE][Laravel][REQUEST]')
        ->toContain('Apa itu impaksi?')
        ->toContain('[REDACTED]')
        ->not->toContain('secret-key')
        ->not->toContain('Bearer secret');
});
