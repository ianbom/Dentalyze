<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse;
use Laravel\Fortify\Contracts\PasswordResetLinkRequestResponse;
use Symfony\Component\HttpFoundation\Response;

class GenericPasswordResetLinkResponse implements FailedPasswordResetLinkRequestResponse, PasswordResetLinkRequestResponse
{
    public function toResponse($request): Response
    {
        return back()->with('status', __('Jika email terdaftar, instruksi reset password akan dikirimkan.'));
    }
}
