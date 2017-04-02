# require 'capistrano/puma/jungle' #if you need the jungle tasks
set :application, 'datagram'
set :repo_url, 'git@github.com:svs/dekko.git'

set :branch, "master"
set :deploy_to, '/home/deploy/datagram'
# set :scm, :git

set :rbenv_type, :system # or :system, depends on your rbenv setup
set :rbenv_ruby, '2.2.0'
set :rbenv_path, "/opt/rbenv"
set :rbenv_prefix, "RBENV_ROOT=#{fetch(:rbenv_path)} RUBY_VERSION=#{fetch(:rbenv_ruby)} #{fetch(:rbenv_path)}/bin/rbenv exec"
set :rbenv_map_bins, %w{rake gem bundle ruby rails}
set :rbenv_roles, :all # default value

set :rails_env, 'production'

set :format, :pretty
set :log_level, :info
set :pty, true

set :linked_files, %w{config/puma.rb config/database.yml config/secrets.yml Procfile config/config.eye.erb }
set :linked_dirs, %w{log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

set :bundle_bins, fetch(:bundle_bins, []).push('rake')
set :bundle_roles, :all
set :bundle_binstubs, -> { shared_path.join('bin') }
set :bundle_gemfile, -> { release_path.join('Gemfile') }
set :bundle_dir, -> { shared_path.join('bundle') }
set :bundle_path, -> { shared_path.join('bundle') }
set :bundle_flags, '--deployment'
set :bundle_without, %w{development test}.join(' ')

set :migration_role, 'db'

set :default_env, {   'PATH' => "/opt/rbenv/shims:/opt/rbenv/bin:$PATH" }


set :puma_conf, "#{shared_path}/config/puma.rb"
set :puma_role, :app
set :puma_access_log, "#{shared_path}/log/puma_error.log"
set :puma_error_log, "#{shared_path}/log/puma_access.log"
set :puma_env, fetch(:rack_env, fetch(:rails_env, 'production'))
set :puma_threads, [0, 16]
set :puma_workers, 0

# set :keep_releases, 5

set :sidekiq_timeout, 10
set :sidekiq_pid, "#{current_path}/tmp/pids/sidekiq.pid"
set :sidekiq_processes, 1
set :sidekiq_concurrency, 1

namespace :deploy do

  desc 'Restart application'
  task :restart do
    on roles(:app) do
      within current_path do
        execute :bundle, "exec pumactl -F config/puma.rb restart"
      end
    end
  end

  after :finishing, 'deploy:cleanup'

end

task :force_stop do
  on roles(:app) do
    within current_path do
      execute :bundle, "exec pumactl -S tmp/pids/puma.state stop" rescue nil
    end
  end
end
#before :force_stop, 'sidekiq:stop'

task :restart do
  on roles(:app) do
    within current_path do
      execute :bundle, "exec pumactl -S tmp/pids/puma.state stop" rescue nil
      execute :bundle, "exec pumactl -F config/puma.rb start"
    end
  end
end

#before :restart, 'sidekiq:stop'
#after :restart, 'sidekiq:start'

task :soft_restart do
  on roles(:app) do
    within current_path do
      execute :bundle, "exec echo free -mot" rescue nil
    end
  end
end

#before :soft_restart, 'sidekiq:stop'
before :soft_restart, 'puma:restart'
#after :soft_restart, 'sidekiq:start'


namespace :foreman do
  namespace :eye do
    task :export do
      on roles(:app) do
        within current_path do
          execute :bundle, "exec foreman export bluepill -c clock=1,watch_consumer=1,perform=2 -a stats  -l #{current_path} -u deploy -r #{shared_path}/tmp/pids -t config/config.eye.erb #{shared_path}/eye"
        end
      end
    end

    task :restart do
      invoke 'foreman:eye:export'
      invoke 'foreman:eye:quit'
      invoke 'foreman:eye:start'
    end

    task :start do
      on roles(:app) do
        within current_path do
          execute :bundle, "exec  eye load #{shared_path}/eye/stats.pill"
          execute :bundle, "exec  eye start queues"
        end
      end

    end

    task :stop do
      on roles(:app) do
        within current_path do
          execute :bundle, "exec eye stop queues"
        end
      end
    end

    task :quit do
      on roles(:app) do
        within current_path do
          execute :bundle, "exec eye stop queues"
          execute :bundle, "exec eye quit"
        end
      end
    end


  end
end


task :foo do
  on roles(:app) do
    execute ""
  end
end
