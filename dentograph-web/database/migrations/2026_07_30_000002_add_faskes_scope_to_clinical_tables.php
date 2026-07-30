<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $legacyId = DB::table('faskes')->insertGetId([
            'name' => 'Faskes Belum Ditentukan',
            'type' => 'legacy',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::table('users', function (Blueprint $table): void {
            $table->foreignId('faskes_id')->nullable()->after('role')->constrained('faskes')->restrictOnDelete();
        });
        Schema::table('patients', function (Blueprint $table): void {
            $table->foreignId('faskes_id')->nullable()->after('user_id')->constrained('faskes')->restrictOnDelete();
        });
        Schema::table('radiographs', function (Blueprint $table): void {
            $table->foreignId('faskes_id')->nullable()->after('id_radiograph')->constrained('faskes')->restrictOnDelete();
            $table->foreignId('review_faskes_id')->nullable()->after('faskes_id')->constrained('faskes')->restrictOnDelete();
            $table->foreignId('assigned_doctor_id')->nullable()->after('id_dokter')->constrained('users')->nullOnDelete();
        });

        DB::table('users')->whereIn('role', ['dokter', 'radiografer'])->update(['faskes_id' => $legacyId]);
        DB::table('patients')->update(['faskes_id' => $legacyId]);
        DB::table('radiographs')->update(['faskes_id' => $legacyId, 'review_faskes_id' => $legacyId]);
    }

    public function down(): void
    {
        Schema::table('radiographs', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('assigned_doctor_id');
            $table->dropConstrainedForeignId('review_faskes_id');
            $table->dropConstrainedForeignId('faskes_id');
        });
        Schema::table('patients', fn (Blueprint $table) => $table->dropConstrainedForeignId('faskes_id'));
        Schema::table('users', fn (Blueprint $table) => $table->dropConstrainedForeignId('faskes_id'));
    }
};
