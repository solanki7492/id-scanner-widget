<?php

namespace App\Services;

use Google\Cloud\Vision\V1\Client\ImageAnnotatorClient;
use Google\Cloud\Vision\V1\Image;
use Google\Cloud\Vision\V1\Feature;
use Google\Cloud\Vision\V1\AnnotateImageRequest;
use Google\Cloud\Vision\V1\BatchAnnotateImagesRequest;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class DocumentOcrService
{
    private ImageAnnotatorClient $visionClient;
    private ImageManager $imageManager;
    private DocumentParserService $parserService;

    public function __construct(DocumentParserService $parserService)
    {
        // Initialize Google Vision client with credentials from config
        $this->visionClient = new ImageAnnotatorClient([
            'credentials' => config('services.google_vision.credentials_path')
        ]);
        
        $this->imageManager = new ImageManager(new Driver());
        $this->parserService = $parserService;
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
        $fields = $this->parserService->parseFields($rawText);
        
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
        $image = (new Image())->setContent($imageContent);
        $feature = (new Feature())->setType(Feature\Type::TEXT_DETECTION);

        $request = (new AnnotateImageRequest())
                    ->setImage($image)
                    ->setFeatures([$feature]);

        $batchRequest = (new BatchAnnotateImagesRequest())
            ->setRequests([$request]);

        $response = $this->visionClient->batchAnnotateImages($batchRequest);
        $annotation = $response->getResponses()[0]->getFullTextAnnotation();

        $result = [
            'full_text' => '',
            'blocks' => [],
        ];

        if ($annotation) {
        $result['full_text'] = $annotation->getText();

        foreach ($annotation->getPages() as $page) {
                foreach ($page->getBlocks() as $block) {
                    foreach ($block->getParagraphs() as $paragraph) {
                        foreach ($paragraph->getWords() as $word) {

                            $text = '';
                            $confidenceSum = 0;
                            $symbolCount = 0;

                            foreach ($word->getSymbols() as $symbol) {
                                $text .= $symbol->getText();
                                $confidenceSum += $symbol->getConfidence();
                                $symbolCount++;
                            }

                            $confidence = $symbolCount > 0
                                ? round($confidenceSum / $symbolCount, 3)
                                : 0;

                            $result['blocks'][] = [
                                'text' => $text,
                                'confidence' => $confidence,
                                'bounds' => $this->getBoundingBoxFromVertices(
                                    $word->getBoundingBox()->getVertices()
                                ),
                            ];
                        }
                    }
                }
            }
        }

        return $result;
    }

    protected function getBoundingBoxFromVertices($vertices): array
    {
        // Convert protobuf RepeatedField → normal PHP array
        if ($vertices instanceof \Google\Protobuf\RepeatedField) {
            $vertices = iterator_to_array($vertices);
        }

        $xs = [];
        $ys = [];

        foreach ($vertices as $v) {
            $xs[] = $v->getX();
            $ys[] = $v->getY();
        }

        $minX = min($xs);
        $maxX = max($xs);
        $minY = min($ys);
        $maxY = max($ys);

        return [
            'x' => $minX,
            'y' => $minY,
            'width' => $maxX - $minX,
            'height' => $maxY - $minY,
        ];
    }

    public function __destruct()
    {
        $this->visionClient->close();
    }
}
