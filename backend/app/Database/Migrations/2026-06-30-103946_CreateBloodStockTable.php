<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBloodStockTable extends Migration
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
            'blood_group_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'units_available' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'critical_threshold' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 10,
            ],
            'low_threshold' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 25,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
 
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('blood_group_id');
        $this->forge->addForeignKey('blood_group_id', 'blood_groups', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('blood_stock');
 
        // Seed initial stock
        $this->db->table('blood_stock')->insertBatch([
            ['blood_group_id' => 1, 'units_available' => 320, 'critical_threshold' => 30, 'low_threshold' => 80],
            ['blood_group_id' => 2, 'units_available' => 85,  'critical_threshold' => 20, 'low_threshold' => 40],
            ['blood_group_id' => 3, 'units_available' => 210, 'critical_threshold' => 30, 'low_threshold' => 60],
            ['blood_group_id' => 4, 'units_available' => 14,  'critical_threshold' => 10, 'low_threshold' => 25],
            ['blood_group_id' => 5, 'units_available' => 95,  'critical_threshold' => 20, 'low_threshold' => 40],
            ['blood_group_id' => 6, 'units_available' => 8,   'critical_threshold' => 10, 'low_threshold' => 25],
            ['blood_group_id' => 7, 'units_available' => 410, 'critical_threshold' => 30, 'low_threshold' => 80],
            ['blood_group_id' => 8, 'units_available' => 142, 'critical_threshold' => 20, 'low_threshold' => 40],
        ]);
    }
 
    public function down()
    {
        $this->forge->dropTable('blood_stock');
    }
}