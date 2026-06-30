<?php

namespace App\Models;

use CodeIgniter\Model;

class ActivityLogModel extends Model
{
    protected $table      = 'activity_logs';
    protected $primaryKey = 'id';
    protected $useTimestamps  = false;
    protected $allowedFields  = [
        'blood_group_id',
        'action',
        'units',
        'note',
        'created_at',
    ];

    // Get all logs with blood group name joined
    public function getAllLogs()
    {
        return $this->select('activity_logs.*, blood_groups.name as blood_group')
                    ->join('blood_groups', 'blood_groups.id = activity_logs.blood_group_id')
                    ->orderBy('activity_logs.id', 'DESC')
                    ->findAll();
    }
}