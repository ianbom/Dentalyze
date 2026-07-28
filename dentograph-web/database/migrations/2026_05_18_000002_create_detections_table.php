<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detections', function (Blueprint $table) {
            $table->id('id_detection');
            $table->string('id_radiograph');
            $table->string('no_fdi', 2);
            $table->string('abnormality')->default('Normal');
            $table->text('analysis')->nullable();
            $table->json('bbox')->nullable();
            $table->string('crop_image')->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('source')->default('ai');
            $table->timestamps();

            $table->foreign('id_radiograph')->references('id_radiograph')->on('radiographs')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detections');
    }
};
