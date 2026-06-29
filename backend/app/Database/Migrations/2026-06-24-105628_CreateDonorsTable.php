<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDonorsTable extends Migration
{
    public function up()
{
    $this->forge->addField([
        'id' => [
            'type'           => 'INT',
            'constraint'     => 11,
            'unsigned'       => true,
            'auto_increment' => true,
        ],
        'user_id' => [
            'type'       => 'INT',
            'constraint' => 11,
            'unsigned'   => true,
            'null'       => true,
        ],

        // Personal
        'full_name' => [
            'type'       => 'VARCHAR',
            'constraint' => 100,
        ],
        'father_husband_name' => [
            'type'       => 'VARCHAR',
            'constraint' => 100,
        ],
        'dob' => [
            'type' => 'DATE',
            'null' => true,
        ],
        'age' => [
            'type'       => 'TINYINT',
            'constraint' => 3,
            'unsigned'   => true,
            'null'       => true,
        ],
        'gender' => [
            'type'       => 'ENUM',
            'constraint' => ['Male', 'Female', 'Other'],
        ],
        'blood_group' => [
            'type'       => 'ENUM',
            'constraint' => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        ],
        'cnic' => [
            'type'       => 'VARCHAR',
            'constraint' => 15,
            'unique'     => true,
        ],
        'photo' => [
            'type'       => 'VARCHAR',
            'constraint' => 255,
            'null'       => true,
        ],

        // Contact
        'whatsapp' => [
            'type'       => 'VARCHAR',
            'constraint' => 20,
        ],
        'address' => [
            'type' => 'TEXT',
        ],
        'city' => [
            'type'       => 'VARCHAR',
            'constraint' => 60,
        ],

        // Preferences
        'donation_location' => [
            'type'       => 'ENUM',
            'constraint' => ['Blood Camp', 'Blood Bank', 'Both'],
        ],
        'available_days' => [
            'type'       => 'VARCHAR',
            'constraint' => 100,
        ],
        'time_slot' => [
            'type'       => 'VARCHAR',
            'constraint' => 60,
        ],

        // Emergency Contact
        'emergency_name' => [
            'type'       => 'VARCHAR',
            'constraint' => 100,
        ],
        'emergency_relation' => [
            'type'       => 'VARCHAR',
            'constraint' => 60,
        ],
        'emergency_phone' => [
            'type'       => 'VARCHAR',
            'constraint' => 20,
        ],

        // Consent
        'signature' => [
            'type'       => 'VARCHAR',
            'constraint' => 100,
        ],
        'status' => [
            'type'       => 'ENUM',
            'constraint' => ['pending', 'approved', 'rejected'],
            'default'    => 'pending',
        ],

        'created_at' => [
            'type' => 'DATETIME',
            'null' => true,
        ],
        'updated_at' => [
            'type' => 'DATETIME',
            'null' => true,
        ],
    ]);

    $this->forge->addKey('id', true);
    $this->forge->addForeignKey('user_id', 'user', 'id', 'CASCADE', 'CASCADE');
    $this->forge->createTable('donors');
}

    public function down()
    {
        $this->forge->dropTable('donors');
    }
}