<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request, UserService $service): Response
    {
        return Inertia::render('users/index', $service->indexData($request->user()));
    }

    public function create(): Response
    {
        return Inertia::render('users/create');
    }

    public function store(StoreUserRequest $request, UserService $service): RedirectResponse
    {
        $service->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('users.index');
    }

    public function show(string $user, UserService $service): Response
    {
        return Inertia::render('users/show', $service->detailData($user));
    }

    public function edit(string $user, UserService $service): Response
    {
        return Inertia::render('users/edit', $service->detailData($user));
    }

    public function update(UpdateUserRequest $request, string $user, UserService $service): RedirectResponse
    {
        $service->update($user, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.show', $user);
    }

    public function destroy(string $user, UserService $service): RedirectResponse
    {
        $service->delete($user);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('users.index');
    }
}
