#clock: clockwork clock.rb
#web: bundle exec puma -C config/heroku-puma.rb
watch_consumer: bundle exec rake  watch_consumer
perform: bundle exec rake --rakefile Rakefile.no_rails perform ENV=development RABBITMQ_URL=amqp://localhost:5672
