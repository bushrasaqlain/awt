<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBloodStockTable extends Migration
{
    public function up()
    {
        // Holds per-blood-group thresholds only (no stock count, no dummy seed)
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
    'donor_id' => [
        'type'       => 'VARCHAR',
        'constraint' => 50,
    ],
    'donation_date' => [
        'type' => 'DATE',
    ],
    'added_by' => [
        'type'       => 'VARCHAR',
        'constraint' => 100,
        'null'       => true,
    ],
    'created_at' => [
        'type' => 'DATETIME',
        'null' => true,
    ],
]);
$this->forge->addPrimaryKey('id');
$this->forge->addForeignKey('blood_group_id', 'blood_groups', 'id', 'CASCADE', 'CASCADE');
$this->forge->createTable('blood_stock', true);
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('blood_group_id');
        $this->forge->addForeignKey('blood_group_id', 'blood_groups', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('blood_group_thresholds');

        // Seed thresholds only — no units_available dummy data
        $this->db->table('blood_group_thresholds')->insertBatch([
            ['blood_group_id' => 1, 'critical_threshold' => 30, 'low_threshold' => 80],
            ['blood_group_id' => 2, 'critical_threshold' => 20, 'low_threshold' => 40],
            ['blood_group_id' => 3, 'critical_threshold' => 30, 'low_threshold' => 60],
            ['blood_group_id' => 4, 'critical_threshold' => 10, 'low_threshold' => 25],
            ['blood_group_id' => 5, 'critical_threshold' => 20, 'low_threshold' => 40],
            ['blood_group_id' => 6, 'critical_threshold' => 10, 'low_threshold' => 25],
            ['blood_group_id' => 7, 'critical_threshold' => 30, 'low_threshold' => 80],
            ['blood_group_id' => 8, 'critical_threshold' => 20, 'low_threshold' => 40],
        ]);

        // Holds one row per donated blood bag — no units_available, no note
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
            'donor_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
            ],
            'donation_date' => [
                'type' => 'DATE',
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('blood_group_id', 'blood_groups', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('blood_stock');
    }

    public function down()
    {
        $this->forge->dropTable('blood_stock');
        $this->forge->dropTable('blood_group_thresholds');
    }
}