<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TriggerWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1; // We handle retries manually
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Document $document,
        public string $event
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get active webhooks for this tenant
        $webhooks = Webhook::where('tenant_id', $this->document->tenant_id)
            ->active()
            ->get();

        foreach ($webhooks as $webhook) {
            if (!$webhook->handlesEvent($this->event)) {
                continue;
            }

            // Create delivery record
            $delivery = WebhookDelivery::create([
                'webhook_id' => $webhook->id,
                'document_id' => $this->document->id,
                'event' => $this->event,
                'payload' => $this->buildPayload(),
                'status' => 'pending',
            ]);

            // Attempt delivery
            DeliverWebhook::dispatch($delivery);
        }
    }

    /**
     * Build webhook payload
     */
    private function buildPayload(): array
    {
        $this->document->load('fields');

        return [
            'event' => $this->event,
            'timestamp' => now()->toIso8601String(),
            'document' => [
                'id' => $this->document->uuid,
                'status' => $this->document->status,
                'document_type' => $this->document->document_type,
                'processed_at' => $this->document->processed_at?->toIso8601String(),
                'normalized' => $this->document->getNormalizedData(),
                'raw' => $this->document->getRawData(),
                'error_message' => $this->document->error_message,
            ],
        ];
    }
}
