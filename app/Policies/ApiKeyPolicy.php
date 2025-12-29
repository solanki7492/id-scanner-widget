<?php

namespace App\Policies;

use App\Models\ApiKey;
use App\Models\User;

class ApiKeyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ApiKey $apiKey): bool
    {
        return $user->tenant_id === $apiKey->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, ApiKey $apiKey): bool
    {
        return $user->tenant_id === $apiKey->tenant_id && $user->isAdmin();
    }

    public function delete(User $user, ApiKey $apiKey): bool
    {
        return $user->tenant_id === $apiKey->tenant_id && $user->isAdmin();
    }
}
