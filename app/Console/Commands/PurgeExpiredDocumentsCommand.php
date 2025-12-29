<?php

namespace App\Console\Commands;

use App\Jobs\PurgeExpiredDocuments;
use Illuminate\Console\Command;

class PurgeExpiredDocumentsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'documents:purge-expired';

    /**
     * The console command description.
     */
    protected $description = 'Purge documents that have exceeded their retention period';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting document purge process...');
        
        PurgeExpiredDocuments::dispatch();
        
        $this->info('Document purge job dispatched successfully.');
        
        return Command::SUCCESS;
    }
}
