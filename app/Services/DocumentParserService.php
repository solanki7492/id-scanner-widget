<?php

namespace App\Services;

class DocumentParserService
{
    /**
     * Parse and normalize document fields based on document type
     */
    public function parseFields(array $rawText): array
    {
        $fullText = $rawText['full_text'] ?? '';
        $blocks = $rawText['blocks'] ?? [];

        $docType = $this->classifyDocument($fullText);

        return match ($docType) {
            'CURACAO_DL' => $this->parseDrivingLicense($fullText, $blocks),
            'CURACAO_ID' => $this->parseCuracaoId($fullText, $blocks),
            default => $this->parseGenericId($fullText, $blocks),
        };
    }

    /**
     * Classify document type based on text patterns
     */
    private function classifyDocument(string $fullText): string
    {
        $text = strtoupper($fullText);

        if (str_contains($text, 'RIJBEWIJS')) {
            return 'CURACAO_DL';
        }

        if (str_contains($text, 'IDENTITEITSKAART')) {
            return 'CURACAO_ID';
        }

        return 'GENERIC_ID';
    }

    /**
     * Preprocess text for parsing
     */
    private function preprocessText(string $text): array
    {
        $text = strtoupper($text);
        $text = preg_replace('/[^A-Z0-9\s\-\/]/', ' ', $text);
        $lines = array_filter(array_map('trim', explode("\n", $text)));
        return array_values($lines);
    }

    /**
     * Parse Curaçao driving license
     */
    private function parseDrivingLicense(string $text, array $blocks): array
    {
        $lines = $this->preprocessText($text);

        $name = $this->extractCuracaoName($lines);
        $dob = $this->extractCuracaoDob($lines);
        $doc = $this->extractCuracaoDocNumber($lines);
        $exp = $this->extractCuracaoExpiry($lines);

        return [
            'document_type' => 'DRIVING_LICENSE',
            'issuing_country' => 'CW',
            'name' => $this->formatField($name, $blocks),
            'dob' => $this->formatField($dob, $blocks),
            'document_number' => $this->formatField($doc, $blocks),
            'nationality' => $this->formatField('CW', $blocks),
            'expiry_date' => $this->formatField($exp, $blocks),
        ];
    }

    /**
     * Parse Curaçao ID card
     */
    private function parseCuracaoId(string $text, array $blocks): array
    {
        $lines = $this->preprocessText($text);

        return [
            'document_type' => 'NATIONAL_ID',
            'issuing_country' => 'CW',
            'name' => $this->formatField($this->extractIdName($lines), $blocks),
            'dob' => $this->formatField($this->extractIdDob($lines), $blocks),
            'place_of_birth' => $this->formatField($this->extractIdPlaceOfBirth($lines), $blocks),
            'gender' => $this->formatField($this->extractIdGender($lines), $blocks),
            'nationality' => $this->formatField($this->extractIdNationality($lines), $blocks),
            'document_number' => $this->formatField($this->extractIdNumber($lines), $blocks),
            'issue_date' => $this->formatField($this->extractIdIssueDate($lines), $blocks),
            'expiry_date' => $this->formatField($this->extractIdExpiry($lines), $blocks),
            'card_number' => $this->formatField($this->extractIdCardNumber($lines), $blocks),
        ];
    }

    /**
     * Parse generic ID document
     */
    private function parseGenericId(string $fullText, array $blocks): array
    {
        return [
            'document_type' => 'GENERIC_ID',
            'name' => $this->extractName($fullText, $blocks),
            'dob' => $this->extractDateOfBirth($fullText, $blocks),
            'nationality' => $this->extractNationality($fullText, $blocks),
            'document_number' => $this->extractDocumentNumber($fullText, $blocks),
            'expiry_date' => $this->extractExpiryDate($fullText, $blocks),
        ];
    }

    // ========================================
    // Curaçao Driving License Extractors
    // ========================================

    private function extractCuracaoName(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            // Find DOB line
            if (preg_match('/\d{2}\-[A-Z]{3}\-\d{4}/', $lines[$i])) {
                $candidates = [];

                // Scan 2–6 lines above DOB
                for ($j = max(0, $i - 6); $j <= $i - 2; $j++) {
                    $text = trim($lines[$j]);

                    if ($this->looksLikeHumanName($text)) {
                        $candidates[] = $text;
                    }
                }

                // Prefer the longest name candidate
                usort($candidates, fn($a, $b) => strlen($b) <=> strlen($a));

                return $candidates[0] ?? null;
            }
        }

        return null;
    }

    private function looksLikeHumanName(string $text): bool
    {
        if (strlen($text) < 4 || strlen($text) > 40) {
            return false;
        }

        if (!preg_match('/^[A-Z ]+$/', $text)) {
            return false;
        }

        // Reject obvious non-names
        $blacklist = ['CURACAO', 'RIJBEWIJS', 'DRIVING', 'LICENCE', 'PERMISO'];
        foreach ($blacklist as $bad) {
            if (str_contains($text, $bad)) {
                return false;
            }
        }

        // Must contain at least one space (first + last)
        return substr_count($text, ' ') >= 1;
    }

    private function extractCuracaoDob(array $lines): ?string
    {
        foreach ($lines as $line) {
            if (preg_match('/\d{2}\-[A-Z]{3}\-\d{4}/', $line)) {
                return $line;
            }
        }

        return null;
    }

    private function extractCuracaoDocNumber(array $lines): ?string
    {
        foreach ($lines as $line) {
            if (preg_match('/\b\d{9,10}\b/', $line)) {
                return $line;
            }
        }

        return null;
    }

    private function extractCuracaoExpiry(array $lines): ?string
    {
        $dates = [];

        foreach ($lines as $line) {
            if (preg_match('/\d{2}\s[A-Z]{3}\s\d{4}/', $line, $m)) {
                $dates[] = $m[0];
            }
        }

        if (count($dates)) {
            usort($dates, fn($a, $b) => strtotime($b) <=> strtotime($a));
            return $dates[0];
        }

        return null;
    }

    // ========================================
    // Curaçao ID Card Extractors
    // ========================================

    private function extractIdName(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'GIVEN NAMES')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdDob(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'DATE OF BIRTH')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdPlaceOfBirth(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'PLACE OF BIRTH')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdGender(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'SEX')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdNationality(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'NATIONALITY')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdNumber(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'ID NUMBER')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdIssueDate(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'DATE OF ISSUE')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdExpiry(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'DATE OF EXPIRY')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    private function extractIdCardNumber(array $lines): ?string
    {
        for ($i = 0; $i < count($lines); $i++) {
            if (str_contains($lines[$i], 'CARD NUMBER')) {
                return trim($lines[$i + 1] ?? '');
            }
        }

        return null;
    }

    // ========================================
    // Generic ID Extractors
    // ========================================

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

    // ========================================
    // Field Formatting and Normalization
    // ========================================

    private function formatField(?string $value, array $blocks): array
    {
        if (!$value) {
            return [
                'raw_value' => null,
                'normalized_value' => null,
                'confidence' => 0.0,
            ];
        }

        return [
            'raw_value' => $value,
            'normalized_value' => $this->normalizeValue($value),
            'confidence' => $this->getFieldConfidence($value, $blocks),
        ];
    }

    private function normalizeValue(string $value): string
    {
        if (preg_match('/\d{2}[-\s][A-Z]{3}[-\s]\d{4}/', $value)) {
            return date('Y-m-d', strtotime($value));
        }

        return trim(ucwords(strtolower($value)));
    }

    private function normalizeName(string $name): string
    {
        return trim(ucwords(strtolower($name)));
    }

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
}
