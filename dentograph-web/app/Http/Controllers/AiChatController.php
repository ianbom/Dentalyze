<?php

namespace App\Http\Controllers;

use App\Models\AiChatSession;
use App\Services\AiContextService;
use App\Services\AiLlmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiChatController extends Controller
{
    public function index(Request $request, AiContextService $contextService): Response
    {
        $user = $request->user();
        $session = AiChatSession::firstOrCreate(
            ['user_id' => $user->id],
            ['title' => 'Chat Dentalyze AI'],
        );

        return Inertia::render('ai-chat/index', [
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
            ],
            'messages' => $session
                ->messages()
                ->latest()
                ->limit(20)
                ->get()
                ->reverse()
                ->values()
                ->map(fn ($message): array => [
                    'id' => $message->id,
                    'role' => $message->role,
                    'content' => $message->content,
                    'provider' => $message->metadata['provider'] ?? null,
                ]),
            'role_context' => [
                'role' => $user->role,
                'summary' => $contextService->compactText($user),
            ],
        ]);
    }

    public function message(Request $request, AiLlmService $llm): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:2000'],
            'session_id' => ['nullable', 'integer', 'exists:ai_chat_sessions,id'],
        ]);

        $user = $request->user();
        $session = AiChatSession::query()
            ->where('user_id', $user->id)
            ->when($validated['session_id'] ?? null, fn ($query, int $id) => $query->whereKey($id))
            ->first();

        if (! $session) {
            $session = AiChatSession::create([
                'user_id' => $user->id,
                'title' => str($validated['message'])->limit(48)->toString(),
            ]);
        }

        $session->messages()->create([
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        ;

        $answer = $llm->chat($user, $validated['message']);

        $assistantMessage = $session->messages()->create([
            'role' => 'assistant',
            'content' => $answer['answer'],
            'metadata' => [
                'provider' => $answer['provider'],
            ],
        ]);

        return response()->json([
            'message' => [
                'id' => $assistantMessage->id,
                'role' => 'assistant',
                'content' => $assistantMessage->content,
                'provider' => $answer['provider'],
            ],
        ]);
    }
}
