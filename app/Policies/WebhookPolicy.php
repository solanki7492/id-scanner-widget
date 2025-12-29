<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Webhook;

class WebhookPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Webhook $webhook): bool
    {
        return $user->tenant_id === $webhook->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Webhook $webhook): bool
    {
        return $user->tenant_id === $webhook->tenant_id && $user->isAdmin();
    }

    public function delete(User $user, Webhook $webhook): bool
    {
        return $user->tenant_id === $webhook->tenant_id && $user->isAdmin();
    }
}
