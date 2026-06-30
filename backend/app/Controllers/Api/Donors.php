<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\DonorModel;
use App\Models\UserModel;

class Donors extends BaseController
{
    private DonorModel $donorModel;
    private UserModel $userModel;

    public function __construct()
    {
        $this->donorModel = new DonorModel();
        $this->userModel = new UserModel();

        // Enable session for auto-login
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
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

        // ── Step 3: Create Donor Profile ─────────────────────
        $donorData = [
            'user_id'            => $userId,
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

        $donorId = $this->donorModel->getInsertID();

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
                'donor_id' => $donorId,
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
}
