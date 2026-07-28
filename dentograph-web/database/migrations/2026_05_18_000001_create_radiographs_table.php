<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('radiographs', function (Blueprint $table) {
            $table->string('id_radiograph')->primary();
            $table->foreignId('id_dokter')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('id_radiografer')->nullable()->constrained('users')->nullOnDelete();
            $table->string('patient_nik', 16);
            $table->string('image');
            $table->string('result_image')->nullable();
            $table->string('status')->default('menunggu');
            $table->timestamps();

            $table->foreign('patient_nik')->references('nik')->on('patients')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('radiographs');
    }
};
