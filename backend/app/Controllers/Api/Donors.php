<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\DonorModel;      // ← add this
use App\Models\UserModel;
use App\Models\HistoryModel;

class Donors extends BaseController
{
    private DonorModel $donorModel;      // ← add this
    private UserModel $userModel;
    private HistoryModel $historyModel;

    public function __construct()
    {
        $this->donorModel   = new DonorModel();   // ← add this
        $this->userModel    = new UserModel();
        $this->historyModel = new HistoryModel();

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function index(): \CodeIgniter\HTTP\ResponseInterface
    {
        $donors = $this->donorModel
            ->select('donors.*, cities.name as city_name')
            ->join('cities', 'cities.id = donors.city', 'left')
            ->findAll();

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'data'   => $donors,
        ]);
    }
    private function generateUniqueDonorId(): string
    {
        do {
            $donorId = 'AWT-' . random_int(100000, 999999);
        } while ($this->donorModel->donorIdExists($donorId));

        return $donorId;
    }

    public function register(): \CodeIgniter\HTTP\ResponseInterface
    {
        try {
            log_message('debug', 'Donor registration request received');

            // Get all POST data
            $fullName          = trim($this->request->getPost('fullName')          ?? '');
            $password          = bin2hex(random_bytes(4)); // auto-generated plain password
            $dob               = trim($this->request->getPost('dob')               ?? '');
            $age               = trim($this->request->getPost('age')               ?? '');
            $gender            = trim($this->request->getPost('gender')            ?? '');
            $bloodGroup        = trim($this->request->getPost('bloodGroup')        ?? '');
            $weight            = trim($this->request->getPost('weight')            ?? '');
            $cnic              = trim($this->request->getPost('cnic')              ?? '');
            $whatsapp          = trim($this->request->getPost('whatsapp')          ?? '');
            $email             = trim($this->request->getPost('email')             ?? '');
            $address           = trim($this->request->getPost('address')           ?? '');
            $city              = trim($this->request->getPost('city')              ?? '');
            $donationLocation  = trim($this->request->getPost('donationLocation')  ?? '');
            $emergencyName     = trim($this->request->getPost('emergencyName')     ?? '');
            $emergencyRelation = trim($this->request->getPost('emergencyRelation') ?? '');
            $emergencyPhone    = trim($this->request->getPost('emergencyPhone')    ?? '');

            // ── Validation ────────────────────────────────────────
            $errors = [];

            // User validation (email only — password is auto-generated)
            if (empty($email)) {
                $errors['email'] = 'Email is required.';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Enter a valid email address.';
            } elseif ($this->userModel->findByEmail($email)) {
                $errors['email'] = 'This email is already registered.';
            }

            // Donor validation
            if (empty($fullName))          $errors['fullName']          = 'Full name is required.';
            if (empty($dob) && empty($age)) $errors['dob']               = 'Date of birth or age is required.';
            if (empty($gender))            $errors['gender']            = 'Gender is required.';
            if (empty($bloodGroup))        $errors['bloodGroup']        = 'Blood group is required.';
            if (empty($weight)) {
                $errors['weight'] = 'Weight is required.';
            } elseif (!is_numeric($weight) || $weight < 45 || $weight > 160) {
                $errors['weight'] = 'Weight must be between 45-160 kg.';
            }
            if (empty($whatsapp))          $errors['whatsapp']          = 'WhatsApp number is required.';
            if (empty($address))           $errors['address']           = 'Address is required.';
            if (empty($city))              $errors['city']              = 'City is required.';
            if (empty($donationLocation))  $errors['donationLocation']  = 'Donation location is required.';
            if (empty($emergencyName))     $errors['emergencyName']     = 'Emergency contact name is required.';
            if (empty($emergencyRelation)) $errors['emergencyRelation'] = 'Relationship is required.';
            if (empty($emergencyPhone))    $errors['emergencyPhone']    = 'Emergency phone is required.';

            // CNIC validation
            $cnicDigits = preg_replace('/\D/', '', $cnic);
            if (empty($cnicDigits)) {
                $errors['cnic'] = 'CNIC is required.';
            } elseif (strlen($cnicDigits) !== 13) {
                $errors['cnic'] = 'CNIC must be 13 digits.';
            } elseif ($this->donorModel->cnicExists($cnic)) {
                $errors['cnic'] = 'This CNIC is already registered.';
            }

            if (!empty($errors)) {
                return $this->response->setStatusCode(422)->setJSON([
                    'status'  => false,
                    'message' => 'Validation failed.',
                    'errors'  => $errors,
                ]);
            }
            // Donor validation
            if (empty($fullName))          $errors['fullName']          = 'Full name is required.';
            if (empty($dob) && empty($age)) $errors['dob']               = 'Date of birth or age is required.';
            if (empty($gender))            $errors['gender']            = 'Gender is required.';
            if (empty($bloodGroup))        $errors['bloodGroup']        = 'Blood group is required.';
            if (empty($weight)) {
                $errors['weight'] = 'Weight is required.';
            } elseif (!is_numeric($weight) || $weight < 45 || $weight > 160) {
                $errors['weight'] = 'Weight must be between 45-160 kg.';
            }
            if (empty($whatsapp))          $errors['whatsapp']          = 'WhatsApp number is required.';
            if (empty($address))           $errors['address']           = 'Address is required.';
            if (empty($city))              $errors['city']              = 'City is required.';
            if (empty($donationLocation))  $errors['donationLocation']  = 'Donation location is required.';
            if (empty($emergencyName))     $errors['emergencyName']     = 'Emergency contact name is required.';
            if (empty($emergencyRelation)) $errors['emergencyRelation'] = 'Relationship is required.';
            if (empty($emergencyPhone))    $errors['emergencyPhone']    = 'Emergency phone is required.';

            // CNIC validation
            $cnicDigits = preg_replace('/\D/', '', $cnic);
            if (empty($cnicDigits)) {
                $errors['cnic'] = 'CNIC is required.';
            } elseif (strlen($cnicDigits) !== 13) {
                $errors['cnic'] = 'CNIC must be 13 digits.';
            } elseif ($this->donorModel->cnicExists($cnic)) {
                $errors['cnic'] = 'This CNIC is already registered.';
            }

            if (!empty($errors)) {
                return $this->response->setStatusCode(422)->setJSON([
                    'status'  => false,
                    'message' => 'Validation failed.',
                    'errors'  => $errors,
                ]);
            }

            // ── Step 1: Create User Account ──────────────────────
            $userData = [
                'name'           => $fullName,
                'email'          => $email,
                'password'       => password_hash($password, PASSWORD_BCRYPT),
                'plain_password' => $password,
                'accountType'    => 'donor',
                'status'         => 'active',
            ];

            $userId = $this->userModel->insert($userData);

            if (!$userId) {
                $error = $this->userModel->errors();
                log_message('error', 'User creation error: ' . json_encode($error));
                return $this->response->setStatusCode(500)->setJSON([
                    'status'  => false,
                    'message' => 'Failed to create user account.',
                    'errors'  => $error
                ]);
            }

            // ── Step 2: Handle Photo Upload ──────────────────────
            $photoPath = null;
            $photo = $this->request->getFile('photo');
            if ($photo && $photo->isValid() && !$photo->hasMoved()) {
                $uploadPath = WRITEPATH . 'uploads/donors';
                if (!is_dir($uploadPath)) {
                    mkdir($uploadPath, 0777, true);
                }
                $newName = $photo->getRandomName();
                $photo->move($uploadPath, $newName);
                $photoPath = 'uploads/donors/' . $newName;
            }
            $donorCode = $this->generateUniqueDonorId();

            // ── Step 3: Create Donor Profile ─────────────────────
            $donorData = [
                'user_id'            => $userId,
                'donor_id'           => $donorCode,
                'full_name'          => $fullName,
                'dob'                => !empty($dob) ? $dob : null,
                'age'                => !empty($age) ? $age : null,
                'gender'             => $gender,
                'blood_group'        => $bloodGroup,
                'weight'             => $weight,
                'cnic'               => $cnic,
                'photo'              => $photoPath,
                'whatsapp'           => $whatsapp,
                'address'            => $address,
                'city'               => $city,
                'donation_location'  => $donationLocation,
                'emergency_name'     => $emergencyName,
                'emergency_relation' => $emergencyRelation,
                'emergency_phone'    => $emergencyPhone,
                'status'             => 'pending',
            ];

            if (!$this->donorModel->insert($donorData)) {
                $this->userModel->delete($userId);

                $error = $this->donorModel->errors();
                log_message('error', 'Donor creation error: ' . json_encode($error));
                return $this->response->setStatusCode(500)->setJSON([
                    'status'  => false,
                    'message' => 'Failed to save donor profile.',
                    'errors'  => $error
                ]);
            }

            $donorPk = $this->donorModel->getInsertID();
            $this->historyModel->logCreation('donors', $donorPk, array_merge($donorData, ['user_id' => $userId]));
            // ── Step 4: Auto-login the user ──────────────────────
            $_SESSION['awt_user'] = [
                'id'    => $userId,
                'name'  => $fullName,
                'email' => $email,
                'role'  => 'donor',
            ];

            return $this->response->setStatusCode(201)->setJSON([
                'status'  => true,
                'message' => 'Registration successful!',
                'data'    => [
                    'user_id'  => $userId,
                    'donor_pk' => $donorPk,
                    'donor_id' => $donorCode,
                    'name'     => $fullName,
                ]
            ]);
        } catch (\Exception $e) {
            log_message('error', 'Donor registration exception: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());

            return $this->response->setStatusCode(500)->setJSON([
                'status'  => false,
                'message' => 'Server error: ' . $e->getMessage()
            ]);
        }
    }
  public function updateStatus($donorId)
{
    try {
        $rawBody = $this->request->getBody();
        $json = json_decode($rawBody, true);
        $newStatus = $json['status'] ?? $this->request->getPost('status');

        $allowedStatuses = ['pending', 'approved', 'rejected'];
        if (!in_array($newStatus, $allowedStatuses, true)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Invalid status. Allowed values: pending, approved, rejected',
            ]);
        }

        $donor = $this->donorModel->find($donorId);
        if (!$donor) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'Donor not found',
            ]);
        }

        $oldStatus = $donor['status'];

        $updated = $this->donorModel->update($donorId, ['status' => $newStatus]);
        if (!$updated) {
            $errors = $this->donorModel->errors();
            log_message('error', 'Donor update error: ' . json_encode($errors));
            return $this->response->setStatusCode(500)->setJSON([
                'status' => false,
                'message' => 'Failed to update donor status',
                'errors' => $errors,
            ]);
        }

        $currentUserId = $_SESSION['awt_user']['id'] ?? null;
        $this->historyModel->logStatusChange('donors', (int)$donorId, $oldStatus, $newStatus, $currentUserId);

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'message' => 'Donor status updated successfully',
            'data' => ['id' => $donorId, 'status' => $newStatus],
        ]);
    } catch (\Throwable $e) {
        log_message('error', 'Error updating donor status: ' . $e->getMessage());
        return $this->response->setStatusCode(500)->setJSON([
            'status' => false,
            'message' => 'Server error: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ]);
    }
}
    public function update($donorId): \CodeIgniter\HTTP\ResponseInterface
    {
        $oldData = $this->donorModel->find($donorId);
        if (!$oldData) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'Donor not found',
            ]);
        }

        $fields = [
            'fullName' => 'full_name',
            'fatherHusbandName' => 'father_husband_name',
            'dob' => 'dob',
            'age' => 'age',
            'gender' => 'gender',
            'bloodGroup' => 'blood_group',
            'weight' => 'weight',
            'cnic' => 'cnic',
            'whatsapp' => 'whatsapp',
            'email' => 'email',
            'address' => 'address',
            'city' => 'city',
            'donationLocation' => 'donation_location',
            'emergencyName' => 'emergency_name',
            'emergencyRelation' => 'emergency_relation',
            'emergencyPhone' => 'emergency_phone',
        ];

        $data = [];
        foreach ($fields as $post => $col) {
            $val = $this->request->getPost($post);
            if ($val !== null && $val !== '') {
                $data[$col] = trim($val);
            }
        }

        $updated = $this->donorModel->update($donorId, $data);
        if (!$updated) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => false,
                'message' => 'Failed to update donor',
                'errors' => $this->donorModel->errors(),
            ]);
        }

        $newData = $this->donorModel->find($donorId);
        $currentUserId = $_SESSION['awt_user']['id'] ?? null;

        $currentUserId = $_SESSION['awt_user']['id'] ?? null;
        $this->historyModel->logUpdate('donors', $donorId, $oldData, $newData, $currentUserId);

        return $this->response->setStatusCode(200)->setJSON([
            'status' => true,
            'message' => 'Donor updated successfully',
        ]);
    }
}
