<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table      = 'user';
    protected $primaryKey = 'id';
    protected $returnType = 'array';

    protected $allowedFields = [
        'name',
        'email',
        'password',
        'plain_password',
        'accountType',
        'status',
        'last_login',
        'created_by',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    public function findByEmail(string $email): ?array
    {
        return $this->where('email', $email)->first();
    }

    public function updateLastLogin(int $id): void
    {
        $this->update($id, ['last_login' => date('Y-m-d H:i:s')]);
    }

    public function isActive(array $user): bool
    {
        return $user['status'] === 'active';
    }
}