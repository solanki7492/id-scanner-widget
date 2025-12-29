<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeliverWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1; // We handle retries manually
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public WebhookDelivery $delivery
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $webhook = $this->delivery->webhook;

        try {
            // Prepare headers
            $headers = [
                'Content-Type' => 'application/json',
                'User-Agent' => 'DocumentScanner-Webhook/1.0',
                'X-Webhook-Event' => $this->delivery->event,
                'X-Webhook-Delivery-ID' => $this->delivery->id,
            ];

            // Add signature if secret is configured
            if ($webhook->secret) {
                $signature = $this->generateSignature(
                    json_encode($this->delivery->payload),
                    $webhook->secret
                );
                $headers['X-Webhook-Signature'] = $signature;
            }

            // Send webhook
            $response = Http::timeout(25)
                ->withHeaders($headers)
                ->post($webhook->url, $this->delivery->payload);

            // Update delivery record
            $this->delivery->update([
                'status' => $response->successful() ? 'sent' : 'failed',
                'attempts' => $this->delivery->attempts + 1,
                'response_code' => $response->status(),
                'response_body' => $response->body(),
                'sent_at' => now(),
            ]);

            // Update webhook last triggered
            $webhook->update(['last_triggered_at' => now()]);

            if (!$response->successful()) {
                $this->scheduleRetry();
            }

            Log::info("Webhook delivered", [
                'delivery_id' => $this->delivery->id,
                'webhook_id' => $webhook->id,
                'status_code' => $response->status(),
            ]);

        } catch (\Exception $e) {
            Log::error("Webhook delivery failed", [
                'delivery_id' => $this->delivery->id,
                'webhook_id' => $webhook->id,
                'error' => $e->getMessage(),
            ]);

            $this->delivery->update([
                'status' => 'failed',
                'attempts' => $this->delivery->attempts + 1,
                'error_message' => $e->getMessage(),
            ]);

            $this->scheduleRetry();
        }
    }

    /**
     * Schedule retry with exponential backoff
     */
    private function scheduleRetry(): void
    {
        if ($this->delivery->attempts >= $this->delivery->webhook->max_retries) {
            return;
        }

        // Exponential backoff: 5min, 15min, 60min
        $delays = [5, 15, 60];
        $delayMinutes = $delays[$this->delivery->attempts] ?? 60;

        $this->delivery->update([
            'next_retry_at' => now()->addMinutes($delayMinutes)
        ]);

        // Schedule retry job
        RetryFailedWebhooks::dispatch()->delay(now()->addMinutes($delayMinutes));
    }

    /**
     * Generate HMAC signature
     */
    private function generateSignature(string $payload, string $secret): string
    {
        return 'sha256=' . hash_hmac('sha256', $payload, $secret);
    }
}
