<?php

namespace App\Models;

use CodeIgniter\Model;

class CsrModel extends Model
{
    protected $table      = 'csr';
    protected $primaryKey = 'id';
    protected $returnType = 'array';

    protected $allowedFields = [
        'user_id',
        'name',
        'email',
        'password',
        'plain_password',
        'phone',
        'status',
        'created_by',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}