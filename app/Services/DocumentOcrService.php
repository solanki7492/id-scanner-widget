<?php

namespace App\Services;

use Google\Cloud\Vision\V1\ImageAnnotatorClient;
use Google\Cloud\Vision\V1\Image;
use Google\Cloud\Vision\V1\Feature\Type;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class DocumentOcrService
{
    private ImageAnnotatorClient $visionClient;
    private ImageManager $imageManager;

    public function __construct()
    {
        // Initialize Google Vision client with credentials from config
        $this->visionClient = new ImageAnnotatorClient([
            'credentials' => config('services.google_vision.credentials_path')
        ]);
        
        $this->imageManager = new ImageManager(new Driver());
    }

    /**
     * Process document image and extract fields
     */
    public function extractData(string $imageContent): array
    {
        // Preprocess image
        $processedImage = $this->preprocessImage($imageContent);
        
        // Perform OCR
        $rawText = $this->performOcr($processedImage);
        
        // Parse and normalize fields
        $fields = $this->parseFields($rawText);
        
        return $fields;
    }

    /**
     * Preprocess image for better OCR results
     */
    private function preprocessImage(string $imageContent): string
    {
        try {
            $image = $this->imageManager->read($imageContent);
            
            // Resize if too large (max 4096px)
            if ($image->width() > 4096 || $image->height() > 4096) {
                $image->scale(width: 4096);
            }
            
            // Enhance contrast
            $image->contrast(10);
            
            // Sharpen
            $image->sharpen(10);
            
            return $image->toJpeg(90)->toString();
        } catch (\Exception $e) {
            // Return original if preprocessing fails
            return $imageContent;
        }
    }

    /**
     * Perform OCR using Google Vision API
     */
    private function performOcr(string $imageContent): array
    {
        $image = new Image();
        $image->setContent($imageContent);

        $response = $this->visionClient->textDetection($image);
        $texts = $response->getTextAnnotations();

        $result = [
            'full_text' => '',
            'blocks' => [],
        ];

        if ($texts->count() > 0) {
            // First annotation contains full text
            $result['full_text'] = $texts[0]->getDescription();
            
            // Remaining annotations are individual text blocks
            foreach ($texts as $index => $text) {
                if ($index === 0) continue;
                
                $result['blocks'][] = [
                    'text' => $text->getDescription(),
                    'confidence' => $text->getConfidence() ?? 0.0,
                    'bounds' => $this->getBoundingBox($text),
                ];
            }
        }

        return $result;
    }

    /**
     * Parse and normalize document fields
     */
    private function parseFields(array $rawText): array
    {
        $fullText = $rawText['full_text'] ?? '';
        $blocks = $rawText['blocks'] ?? [];

        return [
            'name' => $this->extractName($fullText, $blocks),
            'dob' => $this->extractDateOfBirth($fullText, $blocks),
            'nationality' => $this->extractNationality($fullText, $blocks),
            'document_number' => $this->extractDocumentNumber($fullText, $blocks),
            'expiry_date' => $this->extractExpiryDate($fullText, $blocks),
        ];
    }

    /**
     * Extract name field
     */
    private function extractName(string $fullText, array $blocks): array
    {
        $patterns = [
            '/(?:Name|NAME|Full Name|FULL NAME)[:\s]*([A-Z\s]+)/i',
            '/(?:Surname|SURNAME)[:\s]*([A-Z\s]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $fullText, $matches)) {
                $name = trim($matches[1]);
                return [
                    'raw_value' => $name,
                    'normalized_value' => $this->normalizeName($name),
                    'confidence' => $this->getFieldConfidence($name, $blocks),
                ];
            }
        }

        return [
            'raw_value' => null,
            'normalized_value' => null,
            'confidence' => 0.0,
        ];
    }

    /**
     * Extract date of birth
     */
    private function extractDateOfBirth(string $fullText, array $blocks): array
    {
        $patterns = [
            '/(?:Date of Birth|DOB|Birth Date)[:\s]*(\d{1,2}[\s\/-]\d{1,2}[\s\/-]\d{2,4})/i',
            '/(\d{1,2}[\s\/-]\d{1,2}[\s\/-]\d{2,4})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $fullText, $matches)) {
                $date = $matches[1];
                return [
                    'raw_value' => $date,
                    'normalized_value' => $this->normalizeDate($date),
                    'confidence' => $this->getFieldConfidence($date, $blocks),
                ];
            }
        }

        return [
            'raw_value' => null,
            'normalized_value' => null,
            'confidence' => 0.0,
        ];
    }

    /**
     * Extract nationality
     */
    private function extractNationality(string $fullText, array $blocks): array
    {
        $patterns = [
            '/(?:Nationality|NATIONALITY)[:\s]*([A-Z\s]+)/i',
            '/(?:Country|COUNTRY)[:\s]*([A-Z\s]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $fullText, $matches)) {
                $nationality = trim($matches[1]);
                return [
                    'raw_value' => $nationality,
                    'normalized_value' => strtoupper($nationality),
                    'confidence' => $this->getFieldConfidence($nationality, $blocks),
                ];
            }
        }

        return [
            'raw_value' => null,
            'normalized_value' => null,
            'confidence' => 0.0,
        ];
    }

    /**
     * Extract document number
     */
    private function extractDocumentNumber(string $fullText, array $blocks): array
    {
        $patterns = [
            '/(?:Document No|Passport No|ID No|Number)[:\s]*([A-Z0-9]+)/i',
            '/([A-Z]{1,2}\d{6,9})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $fullText, $matches)) {
                $docNumber = trim($matches[1]);
                return [
                    'raw_value' => $docNumber,
                    'normalized_value' => strtoupper(str_replace(' ', '', $docNumber)),
                    'confidence' => $this->getFieldConfidence($docNumber, $blocks),
                ];
            }
        }

        return [
            'raw_value' => null,
            'normalized_value' => null,
            'confidence' => 0.0,
        ];
    }

    /**
     * Extract expiry date
     */
    private function extractExpiryDate(string $fullText, array $blocks): array
    {
        $patterns = [
            '/(?:Expiry Date|Expiration Date|Valid Until)[:\s]*(\d{1,2}[\s\/-]\d{1,2}[\s\/-]\d{2,4})/i',
            '/(?:Expires?)[:\s]*(\d{1,2}[\s\/-]\d{1,2}[\s\/-]\d{2,4})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $fullText, $matches)) {
                $date = $matches[1];
                return [
                    'raw_value' => $date,
                    'normalized_value' => $this->normalizeDate($date),
                    'confidence' => $this->getFieldConfidence($date, $blocks),
                ];
            }
        }

        return [
            'raw_value' => null,
            'normalized_value' => null,
            'confidence' => 0.0,
        ];
    }

    /**
     * Normalize name format
     */
    private function normalizeName(string $name): string
    {
        return trim(ucwords(strtolower($name)));
    }

    /**
     * Normalize date to Y-m-d format
     */
    private function normalizeDate(string $date): ?string
    {
        try {
            $date = str_replace(['/', ' '], '-', $date);
            $parsed = date_create_from_format('d-m-Y', $date) 
                   ?: date_create_from_format('m-d-Y', $date)
                   ?: date_create_from_format('Y-m-d', $date);
            
            return $parsed ? $parsed->format('Y-m-d') : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get field confidence from blocks
     */
    private function getFieldConfidence(string $text, array $blocks): float
    {
        $confidences = [];
        
        foreach ($blocks as $block) {
            if (stripos($block['text'], $text) !== false) {
                $confidences[] = $block['confidence'];
            }
        }

        return empty($confidences) ? 0.0 : array_sum($confidences) / count($confidences);
    }

    /**
     * Get bounding box coordinates
     */
    private function getBoundingBox($text): array
    {
        $vertices = $text->getBoundingPoly()->getVertices();
        $bounds = [];
        
        foreach ($vertices as $vertex) {
            $bounds[] = [
                'x' => $vertex->getX(),
                'y' => $vertex->getY(),
            ];
        }
        
        return $bounds;
    }

    public function __destruct()
    {
        $this->visionClient->close();
    }
}
