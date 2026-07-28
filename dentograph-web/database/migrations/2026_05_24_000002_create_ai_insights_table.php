<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_insights', function (Blueprint $table) {
            $table->id();
            $table->string('patient_nik', 16);
            $table->string('id_radiograph')->nullable();
            $table->string('type')->default('condition');
            $table->string('severity')->default('info');
            $table->string('title');
            $table->text('description');
            $table->text('recommendation')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('patient_nik')->references('nik')->on('patients')->cascadeOnDelete();
            $table->foreign('id_radiograph')->references('id_radiograph')->on('radiographs')->nullOnDelete();
            $table->index(['patient_nik', 'id_radiograph']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_insights');
    }
};
