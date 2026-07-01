<?php

namespace App\Models;

use CodeIgniter\Model;

class BloodDonationModel extends Model
{
    protected $table            = 'blood_donations';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'donor_id',
        'blood_group',
        'donation_date',
        'bag_serial',
        'camp_name',
        'notes',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // ── Validation ────────────────────────────────────────────
    protected $validationRules = [
        'donor_id'      => 'required|integer',
        'blood_group'   => 'required|in_list[A+,A-,B+,B-,AB+,AB-,O+,O-]',
        'donation_date' => 'required|valid_date[Y-m-d]',
    ];

    protected $validationMessages = [
        'donor_id' => [
            'required' => 'Donor ID is required.',
            'integer'  => 'Donor ID must be a number.',
        ],
        'blood_group' => [
            'required' => 'Blood group is required.',
            'in_list'  => 'Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-.',
        ],
        'donation_date' => [
            'required'   => 'Donation date is required.',
            'valid_date' => 'Donation date must be a valid date (YYYY-MM-DD).',
        ],
    ];

    // ── Get all donations joined with donor name ──────────────
   public function getAllWithDonor()
{
    return $this->db->table('blood_donations bd')
        ->select('bd.id, bd.donor_id, bd.blood_group, bd.donation_date,
                  bd.bag_serial, bd.camp_name, bd.notes, bd.created_at,
                  d.full_name AS donor_name, d.whatsapp AS donor_phone')  // ← fixed
        ->join('donors d', 'd.id = bd.donor_id', 'left')
        ->orderBy('bd.created_at', 'DESC')
        ->get()
        ->getResultArray();
}

public function getOneWithDonor(int $id)
{
    return $this->db->table('blood_donations bd')
        ->select('bd.*, d.full_name AS donor_name, d.whatsapp AS donor_phone')  // ← fixed
        ->join('donors d', 'd.id = bd.donor_id', 'left')
        ->where('bd.id', $id)
        ->get()
        ->getRowArray();
}

    // ── Check if a bag serial was already scanned ─────────────
    public function bagAlreadyScanned(string $bagSerial): bool
    {
        return $this->where('bag_serial', $bagSerial)->countAllResults() > 0;
    }
}