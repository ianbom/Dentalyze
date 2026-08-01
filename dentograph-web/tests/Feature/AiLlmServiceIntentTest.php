<?php

use App\Models\User;
use App\Services\AiContextService;
use App\Services\AiLlmService;
use App\Services\AiQuestionClassifier;
use App\Services\AiTraceService;
use Illuminate\Support\Facades\Http;

it('uses knowledge context without loading broad user context', function () {
    Http::fake(['http://127.0.0.1:8001/chat' => Http::response(['answer' => 'Impaksi adalah...', 'provider' => 'fastapi'])]);
    config()->set('services.ai_llm.url', 'http://127.0.0.1:8001');

    $context = Mockery::mock(AiContextService::class);
    $context->shouldReceive('knowledgeContext')->once()->andReturn(['intent' => 'knowledge']);
    $context->shouldNotReceive('forUser');

    $result = (new AiLlmService($context, app(AiQuestionClassifier::class), app(AiTraceService::class)))
        ->chat(User::factory()->make(['role' => 'pasien']), 'Apa itu impaksi?');

    expect($result['answer'])->toBe('Impaksi adalah...');
});

it('uses only named patient context for a patient question', function () {
    Http::fake(['http://127.0.0.1:8001/chat' => Http::response(['answer' => 'Data pasien tersedia.', 'provider' => 'fastapi'])]);
    config()->set('services.ai_llm.url', 'http://127.0.0.1:8001');

    $context = Mockery::mock(AiContextService::class);
    $context->shouldReceive('contextForPatientName')->once()->with(Mockery::type(User::class), 'Ian Ale')->andReturn(['intent' => 'patient_name']);
    $context->shouldNotReceive('forUser');

    $result = (new AiLlmService($context, app(AiQuestionClassifier::class), app(AiTraceService::class)))
        ->chat(User::factory()->make(['role' => 'dokter']), 'Bagaimana kondisi pasien Ian Ale?');

    expect($result['answer'])->toBe('Data pasien tersedia.');
});

it('uses own patient context only for patient self clinical questions', function () {
    Http::fake(['http://127.0.0.1:8001/chat' => Http::response(['answer' => 'Data Anda tersedia.', 'provider' => 'fastapi'])]);
    config()->set('services.ai_llm.url', 'http://127.0.0.1:8001');

    $context = Mockery::mock(AiContextService::class);
    $context->shouldReceive('contextForOwnPatient')->once()->andReturn(['intent' => 'self_clinical']);
    $context->shouldNotReceive('forUser');

    $result = (new AiLlmService($context, app(AiQuestionClassifier::class), app(AiTraceService::class)))
        ->chat(User::factory()->make(['role' => 'pasien']), 'Bagaimana kondisi gigi saya?');

    expect($result['answer'])->toBe('Data Anda tersedia.');
});
