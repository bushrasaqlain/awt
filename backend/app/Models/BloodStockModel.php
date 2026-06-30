<?php

namespace App\Models;

use CodeIgniter\Model;

class BloodStockModel extends Model
{
    protected $table      = 'blood_stock';
    protected $primaryKey = 'id';
    protected $useTimestamps  = false;
    protected $allowedFields  = [
        'blood_group_id',
        'units_available',
        'critical_threshold',
        'low_threshold',
        'updated_at',
    ];

    // Get all stock with blood group name joined
    // public function getAllStock()
    // {
    //     return $this->select('blood_stock.*, blood_groups.name as blood_group')
    //                 ->join('blood_groups', 'blood_groups.id = blood_stock.blood_group_id')
    //                 ->findAll();
    // }

    public function getAllStock()
{
    $results = $this->select('blood_stock.*, blood_groups.name as blood_group')
                ->join('blood_groups', 'blood_groups.id = blood_stock.blood_group_id')
                ->findAll();

    // Cast units to integers
    return array_map(function($row) {
        $row['units_available']    = (int) $row['units_available'];
        $row['critical_threshold'] = (int) $row['critical_threshold'];
        $row['low_threshold']      = (int) $row['low_threshold'];
        return $row;
    }, $results);
}

    // Get stock for a single blood group
    public function getStockByGroupId($blood_group_id)
    {
        return $this->select('blood_stock.*, blood_groups.name as blood_group')
                    ->join('blood_groups', 'blood_groups.id = blood_stock.blood_group_id')
                    ->where('blood_stock.blood_group_id', $blood_group_id)
                    ->first();
    }
}