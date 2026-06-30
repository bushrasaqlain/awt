<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use App\Models\CsrModel;
use App\Models\DonorModel;

class Dashboard extends BaseController
{
    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    private function isAdmin(): bool
    {
        return !empty($_SESSION['awt_user']) && $_SESSION['awt_user']['role'] === 'admin';
    }

    public function index(): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Forbidden.',
            ]);
        }

        $donorModel = new DonorModel();
        $csrModel   = new CsrModel();
        $db         = \Config\Database::connect();

        // ── Stat cards ──────────────────────────────────────
        $totalDonors      = $donorModel->countAllResults();
        $totalCsrs         = $csrModel->countAllResults();
        $pendingApprovals  = $donorModel->where('status', 'pending')->countAllResults();

        // ── Recent donors (latest 5) ────────────────────────
        $recentDonors = $donorModel
            ->select('id, full_name as name, blood_group, city, status, created_at')
            ->orderBy('created_at', 'DESC')
            ->limit(5)
            ->find();

        foreach ($recentDonors as &$d) {
            $d['created_at'] = date('Y-m-d', strtotime($d['created_at']));
        }

        // ── Donors grouped by blood group ───────────────────
        $bloodGroupRows = $db->table('donors')
            ->select('blood_group as name, COUNT(*) as value')
            ->groupBy('blood_group')
            ->get()
            ->getResultArray();

        // ── Monthly donations (approved donors per month, current year) ──
        $monthlyRows = $db->table('donors')
            ->select("DATE_FORMAT(created_at, '%b') as month, MONTH(created_at) as month_num, COUNT(*) as donations")
            ->where('YEAR(created_at)', date('Y'))
            ->groupBy('month_num, month')
            ->orderBy('month_num', 'ASC')
            ->get()
            ->getResultArray();

        $monthlyDonations = array_map(fn($r) => [
            'month'     => $r['month'],
            'donations' => (int) $r['donations'],
        ], $monthlyRows);

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'data'   => [
                'stats' => [
                    'totalDonors'      => $totalDonors,
                    'totalCsrs'        => $totalCsrs,
                    'pendingApprovals' => $pendingApprovals,
                    'bloodRequests'    => 0, // wire up once you have a blood_requests table
                ],
                'recentDonors'     => $recentDonors,
                'bloodGroupData'   => $bloodGroupRows,
                'monthlyDonations' => $monthlyDonations,
            ],
        ]);
    }
}