<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateActivityLogsTable extends Migration
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
            'action' => [
                'type'       => 'ENUM',
                'constraint' => ['add', 'edit', 'dispense', 'delete'],
            ],
            'units' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'note' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
 
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('blood_group_id');
        $this->forge->addForeignKey('blood_group_id', 'blood_groups', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('activity_logs');
    }
 
    public function down()
    {
        $this->forge->dropTable('activity_logs');
    }
}