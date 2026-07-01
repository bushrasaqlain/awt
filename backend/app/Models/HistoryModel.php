<?php

namespace App\Models;

use CodeIgniter\Model;

class HistoryModel extends Model
{
    protected $table = 'history';
    protected $primaryKey = 'id';
    protected $returnType = 'array';

    protected $allowedFields = [
        'table_name',
        'record_id',
        'user_id',
        'action_type',
        'changes',
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = false;

    const ACTION_CREATED = 'created';
    const ACTION_UPDATED = 'updated';
    const ACTION_STATUS_CHANGED = 'status_changed';
    const ACTION_DELETED = 'deleted';

    /**
     * Log a creation event for any table
     */
    public function logCreation(string $tableName, int $recordId, array $data, ?int $userId = null)
    {
        $changes = [
            'action' => 'created',
            'data' => $this->removeSensitiveData($data),
        ];

        return $this->insert([
            'table_name'  => $tableName,
            'record_id'   => $recordId,
            'user_id'     => $userId,
            'action_type' => self::ACTION_CREATED,
            'changes'     => json_encode($changes),
        ]);
    }

    /**
     * Log an update event for any table - diffs old vs new
     */
    public function logUpdate(string $tableName, int $recordId, array $oldData, array $newData, ?int $userId = null)
    {
        $changes = [];
        $fields = $this->getComparableFields($oldData, $newData);

        foreach ($fields as $field) {
            if (isset($oldData[$field]) && isset($newData[$field]) && $oldData[$field] != $newData[$field]) {
                $changes[$field] = [
                    'old' => $oldData[$field],
                    'new' => $newData[$field],
                ];
            }
        }

        if (empty($changes)) {
            return false;
        }

        return $this->insert([
            'table_name'  => $tableName,
            'record_id'   => $recordId,
            'user_id'     => $userId,
            'action_type' => self::ACTION_UPDATED,
            'changes'     => json_encode([
                'action'         => 'updated',
                'fields_updated' => array_keys($changes),
                'changes'        => $changes,
                'total_fields'   => count($changes),
            ]),
        ]);
    }

    /**
     * Log a status change for any table
     */
    public function logStatusChange(string $tableName, int $recordId, string $oldStatus, string $newStatus, ?int $userId = null)
    {
        return $this->insert([
            'table_name'  => $tableName,
            'record_id'   => $recordId,
            'user_id'     => $userId,
            'action_type' => self::ACTION_STATUS_CHANGED,
            'changes'     => json_encode([
                'action' => 'status_changed',
                'status' => ['old' => $oldStatus, 'new' => $newStatus],
            ]),
        ]);
    }

    /**
     * Log a deletion for any table
     */
    public function logDeletion(string $tableName, int $recordId, ?int $userId = null)
    {
        return $this->insert([
            'table_name'  => $tableName,
            'record_id'   => $recordId,
            'user_id'     => $userId,
            'action_type' => self::ACTION_DELETED,
            'changes'     => json_encode(['action' => 'deleted']),
        ]);
    }

    /**
     * Get history for one record in one table (e.g. donor #4, or csr #7)
     */
    public function getRecordHistory(string $tableName, int $recordId, int $limit = 50, int $offset = 0)
    {
        $history = $this->where('table_name', $tableName)
                        ->where('record_id', $recordId)
                        ->orderBy('created_at', 'DESC')
                        ->findAll($limit, $offset);

        foreach ($history as &$record) {
            if ($record['changes']) {
                $record['changes'] = json_decode($record['changes'], true);
            }
        }

        return $history;
    }

    /**
     * Get history with user details for one record
     */
    public function getRecordHistoryWithUsers(string $tableName, int $recordId, int $limit = 50, int $offset = 0)
    {
        $history = $this->select('history.*, users.name as user_name, users.email as user_email')
                        ->join('users', 'users.id = history.user_id', 'left')
                        ->where('history.table_name', $tableName)
                        ->where('history.record_id', $recordId)
                        ->orderBy('history.created_at', 'DESC')
                        ->findAll($limit, $offset);

        foreach ($history as &$record) {
            if ($record['changes']) {
                $record['changes'] = json_decode($record['changes'], true);
            }
        }

        return $history;
    }

    /**
     * Get all history across all tables (global audit log)
     */
    public function getRecentHistory(int $limit = 100, ?string $tableName = null)
    {
        $builder = $this->select('history.*, users.name as user_name, users.email as user_email')
                        ->join('users', 'users.id = history.user_id', 'left')
                        ->orderBy('history.created_at', 'DESC');

        if ($tableName) {
            $builder->where('history.table_name', $tableName);
        }

        $history = $builder->findAll($limit);

        foreach ($history as &$record) {
            if ($record['changes']) {
                $record['changes'] = json_decode($record['changes'], true);
            }
        }

        return $history;
    }

    public function getActionCounts(?string $tableName = null, ?int $recordId = null)
    {
        $builder = $this->db->table($this->table);

        if ($tableName) $builder->where('table_name', $tableName);
        if ($recordId)  $builder->where('record_id', $recordId);

        $builder->select('action_type, COUNT(*) as count');
        $builder->groupBy('action_type');

        return $builder->get()->getResultArray();
    }

    private function getComparableFields(array $data1, array $data2): array
    {
        $fields = array_intersect(array_keys($data1), array_keys($data2));
        $exclude = ['id', 'user_id', 'created_at', 'updated_at', 'deleted_at'];
        return array_diff($fields, $exclude);
    }

    private function removeSensitiveData(array $data): array
    {
        $sensitive = ['password', 'cnic', 'photo'];
        foreach ($sensitive as $field) {
            if (isset($data[$field])) {
                $data[$field] = '***HIDDEN***';
            }
        }
        return $data;
    }
}