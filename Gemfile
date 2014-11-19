source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.1.0'
# Use postgresql as the database for Active Record
gem 'pg'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.3'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.0.0'
# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer',  platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
#gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0',          group: :doc

# Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
# gem 'spring',        group: :development

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# Use debugger
# gem 'debugger', group: [:development, :test]

#gem 'clockwork'
gem 'sidekiq'
gem 'restclient'
gem 'slim'
gem 'devise'
gem 'bunny'
gem 'rabbitmq_http_api_client', '>= 1.3.0'
gem 'friendly_id', '~> 5.0.0'
gem 'hashdiff'
gem 'pusher'
gem 'redis'
gem 'hashfilter'
gem 'rails_12factor', group: :production
gem 'puma'
gem 'ace-rails-ap'
gem 'awesome_print'
gem 'rack-cors', :require => 'rack/cors'
gem 'foreman', github: 'svs/foreman'
gem 'eye'
gem 'mustache'
gem 'jsonpath'
gem 'json2json'
gem "pundit"
gem "newrelic_rpm"
#gem "ruby-jq", path: "lib/ruby-jq"
# Stats
gem "keen"

group :development, :test do
  gem 'rspec-rails'
  gem 'guard-rspec'
  gem 'factory_girl_rails'
  gem 'shoulda-matchers', require: false
  gem 'pry-byebug'
  gem 'html2slim'
  gem 'spring-commands-rspec'
  gem 'metric_fu'
  gem 'pry-rails'
  gem 'rspec-legacy_formatters'
  # gem 'faye_formatter', path: '../faye_formatter'
end

group :development do
  gem "capistrano-rails", "~> 1.1"
  gem "capistrano", "~> 3.1"
  gem 'capistrano-rbenv', '~> 2.0.1'
  gem 'capistrano-bundler', '1.1.1'
  gem 'capistrano3-puma', github: "seuros/capistrano-puma"
  gem 'capistrano-sidekiq' , github: 'seuros/capistrano-sidekiq'
end
