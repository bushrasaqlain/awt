<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateHistoryTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'table_name' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'record_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
            ],
            'user_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => true,
            ],
            'action_type' => [
                'type' => 'ENUM',
                'constraint' => ['created', 'updated', 'status_changed', 'deleted'],
                'default' => 'updated',
            ],
            'changes' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey(['table_name', 'record_id']);
        $this->forge->addKey('user_id');
        $this->forge->addKey('action_type');
        $this->forge->addKey('created_at');

        $this->forge->addForeignKey('user_id', 'user', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('history', true);
    }

    public function down()
    {
        $this->forge->dropTable('history', true);
    }
}