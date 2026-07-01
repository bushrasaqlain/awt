<?php

namespace App\Controllers;

use App\Models\BloodDonationModel;
use App\Models\DonorModel;
use CodeIgniter\RESTful\ResourceController;

class BloodDonationController extends ResourceController
{
    protected $donationModel;
    protected $donorModel;

    public function __construct()
    {
        $this->donationModel = new BloodDonationModel();
        $this->donorModel    = new DonorModel();
    }

    // ── GET /api/blood-donations ──────────────────────────────
    // Returns all donations joined with donor info
    public function index()
    {
        $donations = $this->donationModel->getAllWithDonor();

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Donations fetched.',
            'data'    => $donations,
        ]);
    }

    // ── POST /api/blood-donations/scan ────────────────────────
    // Called when a barcode is scanned
    // Expected body: { "raw": "123|A+|2025-07-01" }
    //   OR individual fields: { donor_id, blood_group, donation_date }
    public function scan()
    {
        $body = $this->request->getJSON(true) ?? [];

        // ── Parse raw barcode string if provided ──────────────
        if (!empty($body['raw'])) {
            $parts = explode('|', trim($body['raw']));

            if (count($parts) < 3) {
                return $this->response->setJSON([
                    'status'  => 'error',
                    'message' => 'Invalid barcode format. Expected: donorId|bloodGroup|date',
                ])->setStatusCode(400);
            }

            $donorId      = (int) trim($parts[0]);
            $bloodGroup   = strtoupper(trim($parts[1]));
            $donationDate = trim($parts[2]);
            $bagSerial    = $body['raw']; // store full raw value as bag serial
        } else {
            // Manual entry fallback
            $donorId      = (int) ($body['donor_id']      ?? 0);
            $bloodGroup   = strtoupper($body['blood_group']   ?? '');
            $donationDate = $body['donation_date'] ?? '';
            $bagSerial    = $body['bag_serial']    ?? null;
        }

        // ── Validate required fields ──────────────────────────
        if (!$donorId || !$bloodGroup || !$donationDate) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'donor_id, blood_group, and donation_date are all required.',
            ])->setStatusCode(400);
        }

        // ── Check donor exists ────────────────────────────────
        $donor = $this->donorModel->find($donorId);
        if (!$donor) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => "Donor ID {$donorId} not found. Please register donor first.",
            ])->setStatusCode(404);
        }

        // ── Check duplicate bag scan ──────────────────────────
        if ($bagSerial && $this->donationModel->bagAlreadyScanned($bagSerial)) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'This blood bag has already been scanned.',
            ])->setStatusCode(409);
        }

        // ── Validate blood group ──────────────────────────────
        $validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!in_array($bloodGroup, $validGroups)) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => "Invalid blood group '{$bloodGroup}'.",
            ])->setStatusCode(400);
        }

        // ── Validate date format ──────────────────────────────
        if (!strtotime($donationDate)) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => "Invalid date '{$donationDate}'. Use YYYY-MM-DD format.",
            ])->setStatusCode(400);
        }

        // ── Save to DB ────────────────────────────────────────
        $insertData = [
            'donor_id'      => $donorId,
            'blood_group'   => $bloodGroup,
            'donation_date' => $donationDate,
            'bag_serial'    => $bagSerial,
            'camp_name'     => $body['camp_name'] ?? null,
            'notes'         => $body['notes']     ?? null,
        ];

        $newId = $this->donationModel->insert($insertData);

        if (!$newId) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'Failed to save donation. Please try again.',
            ])->setStatusCode(500);
        }

        // ── Return the saved record with donor info ────────────
        $saved = $this->donationModel->getOneWithDonor((int) $newId);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => "Donation saved for donor: {$donor['name']}.",
            'data'    => $saved,
        ])->setStatusCode(201);
    }

    // ── DELETE /api/blood-donations/:id ──────────────────────
    public function delete($id = null)
    {
        if (!$id) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'ID is required.',
            ])->setStatusCode(400);
        }

        $record = $this->donationModel->find($id);
        if (!$record) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => 'Record not found.',
            ])->setStatusCode(404);
        }

        $this->donationModel->delete($id);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Donation record deleted.',
        ]);
    }
}