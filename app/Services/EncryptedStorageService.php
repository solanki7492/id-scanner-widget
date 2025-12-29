<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EncryptedStorageService
{
    private const CIPHER_METHOD = 'AES-256-CBC';
    
    /**
     * Store an uploaded file with encryption
     */
    public function store(UploadedFile $file, int $tenantId): array
    {
        // Generate encryption key
        $encryptionKey = $this->generateEncryptionKey();
        
        // Read file contents
        $contents = file_get_contents($file->getRealPath());
        
        // Encrypt contents
        $encryptedData = $this->encrypt($contents, $encryptionKey);
        
        // Generate storage path
        $storagePath = $this->generateStoragePath($tenantId, $file->getClientOriginalExtension());
        
        // Store encrypted file
        Storage::disk('s3')->put($storagePath, $encryptedData);
        
        return [
            'storage_path' => $storagePath,
            'encryption_key' => base64_encode($encryptionKey),
            'original_filename' => $file->getClientOriginalName(),
        ];
    }

    /**
     * Retrieve and decrypt a file
     */
    public function retrieve(string $storagePath, string $encryptionKey): string
    {
        $encryptedData = Storage::disk('s3')->get($storagePath);
        $key = base64_decode($encryptionKey);
        
        return $this->decrypt($encryptedData, $key);
    }

    /**
     * Generate a signed URL for temporary access
     */
    public function getSignedUrl(string $storagePath, int $expirationMinutes = 60): string
    {
        return Storage::disk('s3')->temporaryUrl(
            $storagePath,
            now()->addMinutes($expirationMinutes)
        );
    }

    /**
     * Delete a file from storage
     */
    public function delete(string $storagePath): bool
    {
        return Storage::disk('s3')->delete($storagePath);
    }

    /**
     * Check if file exists
     */
    public function exists(string $storagePath): bool
    {
        return Storage::disk('s3')->exists($storagePath);
    }

    /**
     * Encrypt data
     */
    private function encrypt(string $data, string $key): string
    {
        $iv = random_bytes(openssl_cipher_iv_length(self::CIPHER_METHOD));
        $encrypted = openssl_encrypt($data, self::CIPHER_METHOD, $key, 0, $iv);
        
        // Prepend IV to encrypted data
        return $iv . $encrypted;
    }

    /**
     * Decrypt data
     */
    private function decrypt(string $data, string $key): string
    {
        $ivLength = openssl_cipher_iv_length(self::CIPHER_METHOD);
        $iv = substr($data, 0, $ivLength);
        $encrypted = substr($data, $ivLength);
        
        return openssl_decrypt($encrypted, self::CIPHER_METHOD, $key, 0, $iv);
    }

    /**
     * Generate a random encryption key
     */
    private function generateEncryptionKey(): string
    {
        return random_bytes(32); // 256 bits
    }

    /**
     * Generate a storage path for the file
     */
    private function generateStoragePath(int $tenantId, string $extension): string
    {
        $date = now()->format('Y/m/d');
        $filename = Str::uuid() . '.' . $extension;
        
        return "tenants/{$tenantId}/documents/{$date}/{$filename}";
    }

    /**
     * Get file size
     */
    public function getSize(string $storagePath): int
    {
        return Storage::disk('s3')->size($storagePath);
    }

    /**
     * Get file metadata
     */
    public function getMetadata(string $storagePath): array
    {
        return [
            'size' => $this->getSize($storagePath),
            'last_modified' => Storage::disk('s3')->lastModified($storagePath),
            'exists' => $this->exists($storagePath),
        ];
    }
}
