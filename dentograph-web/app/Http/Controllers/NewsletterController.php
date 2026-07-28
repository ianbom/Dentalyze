<?php

namespace App\Http\Controllers;

use App\Mail\NewsletterWelcomeMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
        ]);

        $subscriber = NewsletterSubscriber::query()->firstOrCreate(
            ['email' => mb_strtolower($validated['email'])],
            ['is_active' => true],
        );

        if ($subscriber->wasRecentlyCreated) {
            Mail::to($subscriber->email)->queue(new NewsletterWelcomeMail);
        }

        return back()->with('newsletter_success', $subscriber->wasRecentlyCreated
            ? 'Terima kasih. Email Anda berhasil terdaftar.'
            : 'Email Anda sudah terdaftar.');
    }
}
