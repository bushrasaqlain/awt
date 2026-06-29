<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\userModel;

class Auth extends BaseController
{
    private userModel $userModel;

    public function __construct()
    {
        $this->userModel = new userModel();

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    // ── POST /api/auth/login ──────────────────────────────────

    public function login(): \CodeIgniter\HTTP\ResponseInterface
    {
        $json = $this->request->getJSON(true);

        $email    = trim($json['email']    ?? '');
        $password = trim($json['password'] ?? '');

        if (empty($email) || empty($password)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'  => false,
                'message' => 'Email and password are required.',
            ]);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'  => false,
                'message' => 'Enter a valid email address.',
            ]);
        }

        $user = $this->userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Invalid email or password.',
            ]);
        }

        if (!$this->userModel->isActive($user)) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Your account is suspended. Please contact support.',
            ]);
        }

        $this->userModel->updateLastLogin($user['id']);

        $_SESSION['awt_user'] = [
            'id'          => $user['id'],
            'name'        => $user['name'],
            'email'       => $user['email'],
            'role'        => $user['accountType'],
        ];

        return $this->response->setStatusCode(200)->setJSON([
            'status'  => true,
            'message' => 'Login successful.',
            'user'    => $_SESSION['awt_user'],
        ]);
    }

    // ── POST /api/auth/register ───────────────────────────────
    // Public: donor self-registration only

    public function register(): \CodeIgniter\HTTP\ResponseInterface
    {
        return $this->handleRegister('donor', null);
    }

    // ── POST /api/auth/register/admin ─────────────────────────
    // Postman only — protected by a secret key header

    public function registerAdmin(): \CodeIgniter\HTTP\ResponseInterface
    {
        $secretKey = $this->request->getHeaderLine('X-Admin-Secret');

        if ($secretKey !== getenv('ADMIN_REGISTER_SECRET')) {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Forbidden.',
            ]);
        }

        return $this->handleRegister('admin', null);
    }

    // ── POST /api/auth/register/csr ───────────────────────────
    // Admin only

    public function registerCsr(): \CodeIgniter\HTTP\ResponseInterface
    {
        if (empty($_SESSION['awt_user']) || $_SESSION['awt_user']['role'] !== 'admin') {
            return $this->response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Only admins can register CSR accounts.',
            ]);
        }

        return $this->handleRegister('csr', $_SESSION['awt_user']['id']);
    }

    // ── Shared registration logic ─────────────────────────────

    private function handleRegister(string $role, ?int $createdBy): \CodeIgniter\HTTP\ResponseInterface
    {
        $json = $this->request->getJSON(true);

        $name       = trim($json['name']        ?? '');
        $email      = trim($json['email']       ?? '');
        $password   = trim($json['password']    ?? '');
       

        $errors = [];

        if (empty($name))                                    $errors['name']     = 'Name is required.';
        if (empty($email))                                   $errors['email']    = 'Email is required.';
        elseif (!filter_var($email, FILTER_VALIDATE_EMAIL))  $errors['email']    = 'Enter a valid email.';
        if (empty($password))                                $errors['password'] = 'Password is required.';
        elseif (strlen($password) < 6)                       $errors['password'] = 'Password must be at least 6 characters.';

        if (empty($errors['email']) && $this->userModel->findByEmail($email)) {
            $errors['email'] = 'This email is already registered.';
        }

        if (!empty($errors)) {
            return $this->response->setStatusCode(422)->setJSON([
                'status'  => false,
                'message' => 'Validation failed.',
                'errors'  => $errors,
            ]);
        }

        $insertData = [
    'name'        => $name,
    'email'       => $email,
    'password'    => password_hash($password, PASSWORD_BCRYPT),
    'accountType' => $role,
];




if ($createdBy !== null) {
    $insertData['created_by'] = $createdBy;
}

        // Track who created CSR accounts
        if ($createdBy !== null) {
            $insertData['created_by'] = $createdBy;
        }

        $id = $this->userModel->insert($insertData);

        if (!$id) {
            return $this->response->setStatusCode(500)->setJSON([
                'status'  => false,
                'message' => 'Registration failed. Please try again.',
            ]);
        }

        $user = $this->userModel->find($id);

        // Auto-login only for donor self-registration
        if ($role === 'donor') {
            $_SESSION['awt_user'] = [
    'id'    => $user['id'],
    'name'  => $user['name'],
    'email' => $user['email'],
    'role'  => $user['accountType'],  // map accountType → role for session
];
        }

        $statusCode = $role === 'donor' ? 201 : 200;
        $message    = match($role) {
            'admin'  => 'Admin account created.',
            'csr'    => 'CSR account created.',
            default  => 'Registration successful.',
        };

        return $this->response->setStatusCode($statusCode)->setJSON([
            'status'  => true,
            'message' => $message,
            'user'    => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ]);
    }

    // ── POST /api/auth/logout ─────────────────────────────────

    public function logout(): \CodeIgniter\HTTP\ResponseInterface
    {
        $_SESSION = [];
        session_destroy();

        return $this->response->setStatusCode(200)->setJSON([
            'status'  => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    // ── GET /api/auth/me ──────────────────────────────────────

    public function me(): \CodeIgniter\HTTP\ResponseInterface
    {
        if (empty($_SESSION['awt_user'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Not authenticated.',
            ]);
        }

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'user'   => $_SESSION['awt_user'],
        ]);
    }
}