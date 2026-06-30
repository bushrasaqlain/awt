<?php

namespace App\Models;

use CodeIgniter\Model;

class DonorModel extends Model
{
    protected $table      = 'donors';
    protected $primaryKey = 'id';
    protected $returnType = 'array';

    protected $allowedFields = [
        'user_id',  // <-- Add this to link to user table
        'full_name',
        'father_husband_name',
        'dob',
        'age',
        'gender',
        'blood_group',
        'weight',   
        'cnic',
        'photo',
        'whatsapp',
        'address',
        'city',
        'donation_location',
        'available_days',
        'time_slot',
        'emergency_name',
        'emergency_relation',
        'emergency_phone',
        'signature',
        'status',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    public function cnicExists(string $cnic): bool
    {
        return $this->where('cnic', $cnic)->countAllResults() > 0;
    }
}