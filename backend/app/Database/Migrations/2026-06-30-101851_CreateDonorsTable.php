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
            $this->forge->dropTable('donors', true, true); // Added CASCADE
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
            'weight' => [
                'type'       => 'DECIMAL',
                'constraint' => '5,2',
                'null'       => false,
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
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'donation_location' => [
                'type'       => 'ENUM',
                'constraint' => ['Blood Camp', 'Blood Bank', 'Both'],
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

        // Check if user table exists before adding foreign key
        if ($this->db->tableExists('user')) {
            $this->forge->addForeignKey('user_id', 'user', 'id', 'CASCADE', 'CASCADE');
        } else {
            echo "Warning: 'user' table does not exist. Foreign key skipped.\n";
        }

        // Check if cities table exists before adding foreign key
        if ($this->db->tableExists('cities')) {
            $this->forge->addForeignKey('city', 'cities', 'id', 'CASCADE', 'CASCADE');
        } else {
            echo "Warning: 'cities' table does not exist. Foreign key skipped.\n";
        }
        
        $this->forge->createTable('donors', true);
        echo "Donors table created successfully!\n";
    }

    public function down()
    {
        $this->forge->dropTable('donors', true, true); // Added CASCADE
    }
}
