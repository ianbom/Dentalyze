<?php

use App\Models\AiChatSession;
use App\Models\User;

test('user can delete their chat session and its messages', function () {
    $user = User::factory()->create();
    $session = AiChatSession::create([
        'user_id' => $user->id,
        'title' => 'Percakapan Pasien',
    ]);
    $message = $session->messages()->create([
        'role' => 'user',
        'content' => 'Apa itu karies?',
    ]);

    $this->actingAs($user)
        ->delete(route('ai-chat.destroy', $session))
        ->assertRedirect(route('ai-chat.index'));

    $this->assertDatabaseMissing('ai_chat_sessions', ['id' => $session->id]);
    $this->assertDatabaseMissing('ai_chat_messages', ['id' => $message->id]);
});

test('user cannot delete another users chat session', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $session = AiChatSession::create([
        'user_id' => $owner->id,
        'title' => 'Percakapan Pemilik',
    ]);

    $this->actingAs($otherUser)
        ->delete(route('ai-chat.destroy', $session))
        ->assertNotFound();

    $this->assertDatabaseHas('ai_chat_sessions', ['id' => $session->id]);
});

test('opening chat after deletion creates an empty replacement session', function () {
    $user = User::factory()->create();
    $session = AiChatSession::create([
        'user_id' => $user->id,
        'title' => 'Percakapan Lama',
    ]);

    $this->actingAs($user)
        ->delete(route('ai-chat.destroy', $session));

    $this->actingAs($user)
        ->get(route('ai-chat.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('ai-chat/index')
            ->where('messages', []));

    expect(AiChatSession::query()->where('user_id', $user->id)->count())->toBe(1);
});
