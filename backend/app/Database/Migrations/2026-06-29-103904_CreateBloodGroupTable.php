<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBloodGroupTable extends Migration
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
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'comment'    => 'e.g. A+, A-, B+, B-, AB+, AB-, O+, O-',
            ],
        ]);
 
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('name');
        $this->forge->createTable('blood_groups');
 
        // Seed the 8 blood groups
        $this->db->table('blood_groups')->insertBatch([
            ['name' => 'A+'],
            ['name' => 'A-'],
            ['name' => 'B+'],
            ['name' => 'B-'],
            ['name' => 'AB+'],
            ['name' => 'AB-'],
            ['name' => 'O+'],
            ['name' => 'O-'],
        ]);
    }
 
    public function down()
    {
        $this->forge->dropTable('blood_groups');
    }
}