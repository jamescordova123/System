<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:scaffold-permission-u-i-command')]
#[Description('Command description')]
class ScaffoldPermissionUICommand extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'app:scaffold-permission-ui';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scaffolds the Permission UI (Routes, Controllers, Views)';

    public function handle()
    {
        $this->line('Starting scaffolding...');

        // 1. Create Controller
        $this->call('make:controller', [
            'name' => 'PermissionController',
            '--model' => 'Permission',
            '--api' => false,
        ]);

        // 2. Create Routes
        $this->createRoutes();

        // 3. Create Views
        $this->createViews();

        $this->line('Scaffolding completed!');
    }

    protected function createRoutes()
    {
        $stub = $this->getStub('Controller/routes.stub');
        $path = base_path('routes/admin.php');

        file_put_contents($path, $stub);
        $this->info('Routes created.');
    }

    protected function createViews()
    {
        $dir = base_path('resources/views/admin/permissions');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $this->createView('index.stub', $dir.'/index.blade.php');
        $this->createView('create.stub', $dir.'/create.blade.php');
        $this->createView('edit.stub', $dir.'/edit.blade.php');
    }

    protected function createView($stubName, $path)
    {
        $stub = $this->getStub('Views/'.$stubName);
        file_put_contents($path, $stub);
        $this->info('View created: '.$path);
    }

    protected function getStub($filename)
    {
        return file_get_contents(__DIR__.'/stubs/'.$filename);
    }
}
