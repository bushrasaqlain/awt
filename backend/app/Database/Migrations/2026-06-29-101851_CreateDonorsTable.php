<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDonorsTable extends Migration
{
    public function up()
    {
        // Check if table exists before creating
        if ($this->db->tableExists('donors')) {
            echo "Table 'donors' already exists. Dropping it...\n";
            $this->forge->dropTable('donors', true);
        }

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
        
        // Only add foreign key if the user table exists
        if ($this->db->tableExists('user')) {
            $this->forge->addForeignKey('user_id', 'user', 'id', 'CASCADE', 'CASCADE');
        } else {
            echo "Warning: 'user' table does not exist. Foreign key skipped.\n";
        }
        
        $this->forge->createTable('donors', true); // true = IF NOT EXISTS
        echo "Donors table created successfully!\n";
    }

    public function down()
    {
        $this->forge->dropTable('donors', true);
    }
}