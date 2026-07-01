<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use App\Models\CsrModel;
use App\Models\BloodStockModel;
use App\Models\ActivityLogModel;

class Csr extends BaseController
{
    private CsrModel $csrModel;

    public function __construct()
    {
        $this->csrModel = new CsrModel();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    private function isAdmin(): bool
    {
        return !empty($_SESSION['awt_user']) && $_SESSION['awt_user']['role'] === 'admin';
    }

    private function success($data, $message = 'Success', $code = 200)
    {
        return $this->response->setStatusCode($code)->setJSON([
            'status'  => true,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    private function error($message = 'Error', $code = 400)
    {
        return $this->response->setStatusCode($code)->setJSON([
            'status'  => false,
            'message' => $message,
            'data'    => null,
        ]);
    }

    private function logAction($blood_group_id, $action, $units, $note = null)
    {
        $logModel = new ActivityLogModel();
        $logModel->insert([
            'blood_group_id' => $blood_group_id,
            'action'         => $action,
            'units'          => $units,
            'note'           => $note,
            'created_at'     => date('Y-m-d H:i:s'),
        ]);
    }

    // -------------------------------------------------------
    // GET /api/csr
    // Returns all CSR accounts (admin only)
    // -------------------------------------------------------
    public function index(): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $csrs = $this->csrModel
            ->orderBy('created_at', 'DESC')
            ->findAll();

        $csrs = array_map(function ($c) {
            unset($c['password'], $c['plain_password']);
            return $c;
        }, $csrs);

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'data'   => $csrs,
        ]);
    }

    // -------------------------------------------------------
    // GET /api/stock
    // -------------------------------------------------------
    public function stock(): \CodeIgniter\HTTP\ResponseInterface
    {
        $stockModel = new BloodStockModel();
        $stock = $stockModel->getAllStock();
        return $this->success($stock, 'Stock fetched successfully');
    }

public function add()
{
    $input = $this->request->getJSON(true);

    $blood_group_id = $input['blood_group_id'] ?? null;
    $donor_id       = $input['donor_id'] ?? null;
    $donation_date  = $input['donation_date'] ?? date('Y-m-d');

    if (!$blood_group_id || !$donor_id) {
        return $this->error('blood_group_id and donor_id are required.');
    }

    $added_by = $_SESSION['awt_user']['name'] ?? 'Unknown';

    $stockModel = new BloodStockModel();
    $stockModel->insert([
        'blood_group_id' => $blood_group_id,
        'donor_id'       => $donor_id,
        'donation_date'  => $donation_date,
        'added_by'       => $added_by,
        'created_at'     => date('Y-m-d H:i:s'),
    ]);

    $this->logAction($blood_group_id, 'add', 1, "Donor: $donor_id, by: $added_by");

    return $this->success([
        'donor_id'      => $donor_id,
        'donation_date' => $donation_date,
        'added_by'      => $added_by,
    ], "Added unit successfully (Donor: $donor_id).");
}

    public function edit()
    {
        $input = $this->request->getJSON(true);

        $blood_group_id = $input['blood_group_id'] ?? null;
        $units          = (int)($input['units'] ?? -1);
        $note           = $input['note'] ?? 'Count manually updated';

        if (!$blood_group_id || $units < 0) {
            return $this->error('blood_group_id and units (>= 0) are required.');
        }

        $stockModel = new BloodStockModel();
        $stock = $stockModel->where('blood_group_id', $blood_group_id)->first();

        if (!$stock) return $this->error('Blood group not found.');

        $stockModel->update($stock['id'], ['units_available' => $units, 'updated_at' => date('Y-m-d H:i:s')]);
        $this->logAction($blood_group_id, 'edit', $units, $note);

        return $this->success(['units_available' => $units], "Stock updated to $units unit(s).");
    }

    public function dispense()
    {
        $input = $this->request->getJSON(true);

        $blood_group_id = $input['blood_group_id'] ?? null;
        $units          = (int)($input['units'] ?? 0);
        $note           = $input['note'] ?? null;

        if (!$blood_group_id || $units <= 0) {
            return $this->error('blood_group_id and units (> 0) are required.');
        }

        $stockModel = new BloodStockModel();
        $stock = $stockModel->where('blood_group_id', $blood_group_id)->first();

        if (!$stock) return $this->error('Blood group not found.');

        if ($stock['units_available'] < $units) {
            return $this->error("Not enough stock. Only {$stock['units_available']} unit(s) available.");
        }

        $newUnits = $stock['units_available'] - $units;
        $stockModel->update($stock['id'], ['units_available' => $newUnits, 'updated_at' => date('Y-m-d H:i:s')]);
        $this->logAction($blood_group_id, 'dispense', $units, $note);

        return $this->success(['units_available' => $newUnits], "Dispensed $units unit(s) successfully.");
    }

    public function delete()
    {
        $input = $this->request->getJSON(true);
        $blood_group_id = $input['blood_group_id'] ?? null;

        if (!$blood_group_id) return $this->error('blood_group_id is required.');

        $stockModel = new BloodStockModel();
        $stock = $stockModel->where('blood_group_id', $blood_group_id)->first();

        if (!$stock) return $this->error('Blood group not found.');

        $prevUnits = $stock['units_available'];
        $stockModel->update($stock['id'], ['units_available' => 0, 'updated_at' => date('Y-m-d H:i:s')]);
        $this->logAction($blood_group_id, 'delete', $prevUnits, 'Record cleared by admin');

        return $this->success(['units_available' => 0], 'Blood bag record removed successfully.');
    }

    public function threshold()
    {
        $input = $this->request->getJSON(true);

        $blood_group_id     = $input['blood_group_id'] ?? null;
        $critical_threshold = (int)($input['critical_threshold'] ?? -1);
        $low_threshold      = (int)($input['low_threshold'] ?? -1);

        if (!$blood_group_id || $critical_threshold < 0 || $low_threshold < 0) {
            return $this->error('blood_group_id, critical_threshold, and low_threshold are required.');
        }

        if ($critical_threshold >= $low_threshold) {
            return $this->error('critical_threshold must be less than low_threshold.');
        }

        $stockModel = new BloodStockModel();
        $stock = $stockModel->where('blood_group_id', $blood_group_id)->first();

        if (!$stock) return $this->error('Blood group not found.');

        $stockModel->update($stock['id'], [
            'critical_threshold' => $critical_threshold,
            'low_threshold'      => $low_threshold,
            'updated_at'         => date('Y-m-d H:i:s'),
        ]);

        return $this->success(['critical_threshold' => $critical_threshold, 'low_threshold' => $low_threshold], 'Thresholds updated successfully.');
    }

    public function logs()
    {
        $logModel = new ActivityLogModel();
        $logs = $logModel->getAllLogs();
        return $this->success($logs, 'Logs fetched successfully.');
    }

    public function search()
    {
        $blood_group_id = $this->request->getGet('blood_group_id');
        $stockModel = new BloodStockModel();

        if ($blood_group_id) {
            $stock = $stockModel->getStockByGroupId($blood_group_id);
            if (!$stock) return $this->error('Blood group not found.');
            return $this->success($stock, 'Stock fetched.');
        }

        return $this->success($stockModel->getAllStock(), 'All stock fetched.');
    }

    // -------------------------------------------------------
    // PUT /api/csr/:id
    // -------------------------------------------------------
    public function update($id): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $csr = $this->csrModel->find($id);
        if (!$csr) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'CSR not found.']);
        }

        $json   = $this->request->getJSON(true);
        $name   = trim($json['name']   ?? $csr['name']);
        $phone  = trim($json['phone']  ?? $csr['phone']);
        $status = trim($json['status'] ?? $csr['status']);

        if (!empty($phone)) {
            $cleaned  = str_replace('-', '', $phone);
            $mobile   = preg_match('/^03[0-9]{9}$/', $cleaned);
            $landline = preg_match('/^0[1-9][1-9]\d{7}$/', $cleaned);
            if (!$mobile && !$landline) {
                return $this->response->setStatusCode(422)->setJSON([
                    'status'  => false,
                    'message' => 'Enter a valid Pakistani number (e.g. 051-3657894 or 0315-1863475).',
                ]);
            }
        }

        $updateData = ['name' => $name, 'phone' => $phone, 'status' => $status];

        $userModel = null;
        if (!empty($json['password'])) {
            if (strlen($json['password']) < 6) {
                return $this->response->setStatusCode(422)->setJSON(['status' => false, 'message' => 'Password must be at least 6 characters.']);
            }
            $hashed = password_hash($json['password'], PASSWORD_BCRYPT);
            $updateData['password']       = $hashed;
            $updateData['plain_password'] = $json['password'];

            // keep the base "user" login record in sync
            $userModel = new UserModel();
            $userModel->update($csr['user_id'], [
                'password'       => $hashed,
                'plain_password' => $json['password'],
            ]);
        }

        if ($name !== $csr['name']) {
            $userModel = $userModel ?? new UserModel();
            $userModel->update($csr['user_id'], ['name' => $name]);
        }

        $this->csrModel->update($id, $updateData);
        $updated = $this->csrModel->find($id);
        unset($updated['password'], $updated['plain_password']);

        return $this->response->setStatusCode(200)->setJSON(['status' => true, 'message' => 'CSR updated.', 'data' => $updated]);
    }

    // -------------------------------------------------------
    // DELETE /api/csr/:id
    // -------------------------------------------------------
    public function destroy($id): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $csr = $this->csrModel->find($id);
        if (!$csr) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'CSR not found.']);
        }

        $userModel = new UserModel();
        $userModel->delete($csr['user_id']); // removes login record
        $this->csrModel->delete($id);         // removes csr profile record

        return $this->response->setStatusCode(200)->setJSON(['status' => true, 'message' => 'CSR deleted.']);
    }
}