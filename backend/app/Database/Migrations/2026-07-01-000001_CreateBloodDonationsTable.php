<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBloodDonationsTable extends Migration
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
            'donor_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'blood_group' => [
                'type'       => 'VARCHAR',
                'constraint' => 5,
            ],
            'donation_date' => [
                'type' => 'DATE',
            ],
            'bag_serial' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => true,
                'comment'    => 'Optional: blood bag serial/barcode raw value',
            ],
            'camp_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 150,
                'null'       => true,
            ],
            'notes' => [
                'type' => 'TEXT',
                'null' => true,
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
        $this->forge->addForeignKey('donor_id', 'donors', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('blood_donations', true);
    }

    public function down()
    {
        $this->forge->dropTable('blood_donations', true);
    }
}
