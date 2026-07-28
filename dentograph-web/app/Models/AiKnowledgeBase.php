<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiKnowledgeBase extends Model
{
    protected $fillable = [
        'title',
        'category',
        'condition_name',
        'content',
        'embedding',
        'embedding_model',
        'status',
    ];

    public function getEmbeddingAttribute(mixed $value): ?array
    {
        if (is_array($value)) {
            return $value;
        }

        if (! is_string($value) || $value === '') {
            return null;
        }

        $embedding = json_decode($value, true);

        return is_array($embedding) ? $embedding : null;
    }
}
