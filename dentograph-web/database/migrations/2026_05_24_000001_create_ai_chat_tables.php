<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function vectorColumn(Blueprint $table, string $name, int $dimensions): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            $table->json($name)->nullable();

            return;
        }

        $table->vector($name, dimensions: $dimensions)->nullable();
    }

    public function up(): void
    {
        Schema::create('ai_chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->default('Chat Dentalyze AI');
            $table->timestamps();
        });

        Schema::create('ai_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_chat_session_id')->constrained()->cascadeOnDelete();
            $table->string('role');
            $table->longText('content');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->default('disease');
            $table->string('condition_name')->nullable();
            $table->longText('content');
            $this->vectorColumn($table, 'embedding', 1024);
            $table->string('embedding_model')->nullable();
            $table->enum('status', ['draft', 'active', 'inactive'])->default('draft');
            $table->timestamps();
            $table->index(['condition_name', 'status']);
            $table->index(['category', 'status']);
        });

        Schema::create('ai_chat_message_sources', function (Blueprint $table) {
            $table->id();
                
            $table->foreignId('ai_chat_message_id')
                ->constrained('ai_chat_messages')
                ->cascadeOnDelete();
                
            $table->foreignId('ai_knowledge_base_id')
                ->nullable()
                ->constrained('ai_knowledge_bases')
                ->nullOnDelete();
                
            $table->string('id_radiograph')->nullable();
                
            $table->unsignedBigInteger('detection_id')->nullable();
                
            $table->string('source_label')->nullable();
            $table->decimal('relevance_score', 8, 6)->nullable();
                
            $table->timestamps();
                
            $table->foreign('id_radiograph')
                ->references('id_radiograph')
                ->on('radiographs')
                ->nullOnDelete();
                
            $table->foreign('detection_id')
                ->references('id_detection')
                ->on('detections')
                ->nullOnDelete();
                
            $table->index('ai_chat_message_id');
            $table->index('ai_knowledge_base_id');
            $table->index('id_radiograph');
            $table->index('detection_id');
        });

        Schema::create('knowledge_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('file_path')->nullable();
            $table->string('source')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        Schema::create('knowledge_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_document_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('chunk_index');
            $table->longText('content');
            $this->vectorColumn($table, 'embedding', 1536);
            $table->timestamps();

            $table->index(['knowledge_document_id', 'chunk_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_chunks');
        Schema::dropIfExists('knowledge_documents');
        Schema::dropIfExists('ai_chat_message_sources');
        Schema::dropIfExists('ai_knowledge_bases');
        Schema::dropIfExists('ai_chat_messages');
        Schema::dropIfExists('ai_chat_sessions');
    }
};
