<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('document_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->string('field_name'); // name, dob, nationality, document_number, expiry_date
            $table->text('raw_value')->nullable();
            $table->text('normalized_value')->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['document_id', 'field_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_fields');
    }
};
