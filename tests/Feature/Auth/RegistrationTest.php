<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('registration screen can be rendered', function () {
    $tenant = \App\Models\Tenant::create([
        'id' => 'test-tenant',
        'name' => 'Test Tenant',
        'email' => 'tenant@example.com',
        'password' => 'password',
    ]);

    $response = $this->get("/{$tenant->id}/register");

    $response->assertStatus(200);
});

test('new users can register', function () {
    $tenant = \App\Models\Tenant::create([
        'id' => 'test-tenant',
        'name' => 'Test Tenant',
        'email' => 'tenant@example.com',
        'password' => 'password',
    ]);

    $response = $this->post("/{$tenant->id}/register", [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated('tenant');
    $response->assertRedirect(route('tenant.dashboard', ['tenant' => $tenant->id], absolute: false));
});
