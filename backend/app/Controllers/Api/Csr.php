<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;

class Csr extends BaseController
{
    private UserModel $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    private function isAdmin(): bool
    {
        return !empty($_SESSION['awt_user']) && $_SESSION['awt_user']['role'] === 'admin';
    }

    // GET /api/csr
    public function index(): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $csrs = $this->userModel
            ->where('accountType', 'csr')
            ->orderBy('created_at', 'DESC')
            ->findAll();

        // Remove passwords from response
        $csrs = array_map(function ($c) {
            unset($c['password']);
            return $c;
        }, $csrs);

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'data'   => $csrs,
        ]);
    }

    // PUT /api/csr/:id
    public function update($id): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $csr = $this->userModel->where('id', $id)->where('accountType', 'csr')->first();
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

        // Optionally update password if provided
        if (!empty($json['password'])) {
            if (strlen($json['password']) < 6) {
                return $this->response->setStatusCode(422)->setJSON([
                    'status'  => false,
                    'message' => 'Password must be at least 6 characters.',
                ]);
            }
            $updateData['password'] = password_hash($json['password'], PASSWORD_BCRYPT);
        }

        $this->userModel->update($id, $updateData);

        $updated = $this->userModel->find($id);
        unset($updated['password']);

        return $this->response->setStatusCode(200)->setJSON([
            'status'  => true,
            'message' => 'CSR updated.',
            'data'    => $updated,
        ]);
    }

    // DELETE /api/csr/:id
    public function destroy($id): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $csr = $this->userModel->where('id', $id)->where('accountType', 'csr')->first();
        if (!$csr) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'CSR not found.']);
        }

        $this->userModel->delete($id);

        return $this->response->setStatusCode(200)->setJSON([
            'status'  => true,
            'message' => 'CSR deleted.',
        ]);
    }
}