<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\CityModel;

class Cities extends BaseController
{
    private CityModel $cityModel;

    public function __construct()
    {
        $this->cityModel = new CityModel();

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    private function isAdmin(): bool
    {
        return !empty($_SESSION['awt_user']) && $_SESSION['awt_user']['role'] === 'admin';
    }

    // GET /api/cities
    public function index(): \CodeIgniter\HTTP\ResponseInterface
    {
        $cities = $this->cityModel->orderBy('name', 'ASC')->findAll();

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'data'   => $cities,
        ]);
    }

    // POST /api/cities
    public function store(): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $json = $this->request->getJSON(true);
        $name = trim($json['name'] ?? '');

        if (empty($name)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'  => false,
                'message' => 'City name is required.',
            ]);
        }

        if ($this->cityModel->where('name', $name)->first()) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'  => false,
                'message' => 'City already exists.',
            ]);
        }

        $id = $this->cityModel->insert(['name' => $name, 'status' => 'active']);

        return $this->response->setStatusCode(201)->setJSON([
            'status'  => true,
            'message' => 'City added.',
            'data'    => $this->cityModel->find($id),
        ]);
    }

    // PUT /api/cities/:id
    public function update($id): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $city = $this->cityModel->find($id);
        if (!$city) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'City not found.']);
        }

        $json   = $this->request->getJSON(true);
        $name   = trim($json['name']   ?? $city['name']);
        $status = trim($json['status'] ?? $city['status']);

        $this->cityModel->update($id, ['name' => $name, 'status' => $status]);

        return $this->response->setStatusCode(200)->setJSON([
            'status'  => true,
            'message' => 'City updated.',
            'data'    => $this->cityModel->find($id),
        ]);
    }

    // DELETE /api/cities/:id
    public function destroy($id): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON(['status' => false, 'message' => 'Forbidden.']);
        }

        $city = $this->cityModel->find($id);
        if (!$city) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'City not found.']);
        }

        $this->cityModel->delete($id);

        return $this->response->setStatusCode(200)->setJSON([
            'status'  => true,
            'message' => 'City deleted.',
        ]);
    }

    // POST /api/cities/import  ← NEW
    public function import(): \CodeIgniter\HTTP\ResponseInterface
    {
        if (!$this->isAdmin()) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Forbidden.',
            ]);
        }

        $json = $this->request->getJSON(true);
        $rows = $json['cities'] ?? [];

        if (empty($rows) || !is_array($rows)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'  => false,
                'message' => 'No city data provided.',
            ]);
        }

        $inserted        = 0;
        $skipped         = 0;
        $allowedStatuses = ['active', 'inactive'];

        foreach ($rows as $row) {
            $name   = trim($row['name']   ?? '');
            $status = strtolower(trim($row['status'] ?? 'active'));

            if (empty($name)) { $skipped++; continue; }

            if (!in_array($status, $allowedStatuses)) {
                $status = 'active';
            }

            $exists = $this->cityModel
                ->where('LOWER(name)', strtolower($name))
                ->first();

            if ($exists) { $skipped++; continue; }

            $this->cityModel->insert(['name' => $name, 'status' => $status]);
            $inserted++;
        }

        return $this->response->setStatusCode(200)->setJSON([
            'status'   => true,
            'message'  => "{$inserted} cities imported, {$skipped} skipped (duplicates or invalid).",
            'inserted' => $inserted,
            'skipped'  => $skipped,
        ]);
    }
}