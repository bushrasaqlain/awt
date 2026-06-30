<?php

namespace App\Models;

use CodeIgniter\Model;

class BloodGroupModel extends Model
{
    protected $table      = 'blood_groups';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name'];
}