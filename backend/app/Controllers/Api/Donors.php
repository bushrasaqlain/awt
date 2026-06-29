<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\DonorModel;

class Donors extends BaseController
{
    private DonorModel $donorModel;

    public function __construct()
    {
        $this->donorModel = new DonorModel();
    }

    // ── POST /api/donors/register ─────────────────────────────

    public function register(): \CodeIgniter\HTTP\ResponseInterface
    {
        // FormData (multipart) — use getPost(), not getJSON()
        $fullName          = trim($this->request->getPost('fullName')          ?? '');
        $fatherHusbandName = trim($this->request->getPost('fatherHusbandName') ?? '');
        $dob               = trim($this->request->getPost('dob')               ?? '');
        $age               = trim($this->request->getPost('age')               ?? '');
        $gender            = trim($this->request->getPost('gender')            ?? '');
        $bloodGroup        = trim($this->request->getPost('bloodGroup')        ?? '');
        $cnic              = trim($this->request->getPost('cnic')              ?? '');
        $whatsapp          = trim($this->request->getPost('whatsapp')          ?? '');
        $email             = trim($this->request->getPost('email')             ?? '');
        $address           = trim($this->request->getPost('address')           ?? '');
        $city              = trim($this->request->getPost('city')              ?? '');
        $donationLocation  = trim($this->request->getPost('donationLocation')  ?? '');
        $availableDays     = trim($this->request->getPost('availableDays')     ?? '');
        $timeSlot          = trim($this->request->getPost('timeSlot')          ?? '');
        $emergencyName     = trim($this->request->getPost('emergencyName')     ?? '');
        $emergencyRelation = trim($this->request->getPost('emergencyRelation') ?? '');
        $emergencyPhone    = trim($this->request->getPost('emergencyPhone')    ?? '');
        $signature         = trim($this->request->getPost('signature')         ?? '');

        // ── Validation ────────────────────────────────────────
        $errors = [];

        if (empty($fullName))          $errors['fullName']          = 'Full name is required.';
        if (empty($fatherHusbandName)) $errors['fatherHusbandName'] = 'Father/husband name is required.';
        if (empty($dob) && empty($age))$errors['dob']               = 'Date of birth or age is required.';
        if (empty($gender))            $errors['gender']            = 'Gender is required.';
        if (empty($bloodGroup))        $errors['bloodGroup']        = 'Blood group is required.';
        if (empty($whatsapp))          $errors['whatsapp']          = 'WhatsApp number is required.';
        if (empty($address))           $errors['address']           = 'Address is required.';
        if (empty($city))              $errors['city']              = 'City is required.';
        if (empty($donationLocation))  $errors['donationLocation']  = 'Donation location is required.';
        if (empty($availableDays))     $errors['availableDays']     = 'Available days are required.';
        if (empty($timeSlot))          $errors['timeSlot']          = 'Time slot is required.';
        if (empty($emergencyName))     $errors['emergencyName']     = 'Emergency contact name is required.';
        if (empty($emergencyRelation)) $errors['emergencyRelation'] = 'Relationship is required.';
        if (empty($emergencyPhone))    $errors['emergencyPhone']    = 'Emergency phone is required.';
        if (empty($signature))         $errors['signature']         = 'Signature is required.';

        // CNIC
        $cnicDigits = preg_replace('/\D/', '', $cnic);
        if (empty($cnicDigits)) {
            $errors['cnic'] = 'CNIC is required.';
        } elseif (strlen($cnicDigits) !== 13) {
            $errors['cnic'] = 'CNIC must be 13 digits.';
        } elseif ($this->donorModel->cnicExists($cnic)) {
            $errors['cnic'] = 'This CNIC is already registered.';
        }