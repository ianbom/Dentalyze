<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('radiographs', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('assigned_doctor_id');
            $table->dropConstrainedForeignId('review_faskes_id');
        });
    }

    public function down(): void
    {
        Schema::table('radiographs', function (Blueprint $table): void {
            $table->foreignId('review_faskes_id')->nullable()->after('faskes_id')->constrained('faskes')->restrictOnDelete();
            $table->foreignId('assigned_doctor_id')->nullable()->after('id_dokter')->constrained('users')->nullOnDelete();
        });
    }
};
