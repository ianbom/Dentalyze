<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faskes', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('type');
            $table->timestamps();
        });

        Schema::create('faskes_collaborations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('faskes_id')->constrained('faskes')->cascadeOnDelete();
            $table->foreignId('collaborator_faskes_id')->constrained('faskes')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['faskes_id', 'collaborator_faskes_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faskes_collaborations');
        Schema::dropIfExists('faskes');
    }
};
