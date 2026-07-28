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

    // protected function casts(): array
    // {
    //     return [
    //         'embedding' => 'array',
    //     ];
    // }
}
