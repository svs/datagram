task :watch_consumer => :environment do
  Rails.logger.info 'Started #WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    Rails.logger.info "#WatchConsumer processing..."
    begin
      pl = JSON.parse(payload)
      w = WatchResponseHandler.new(pl).handle!
      Pusher.trigger(w[:watch_token] || w[:watch_response_token], 'data', w)
      Rails.logger.info "ResponseConsumer#watch_consumer on channel #{w[:token]}"
    rescue Exception => e
      puts e.message
      puts e.backtrace
    end
  end
end


task :datagram_consumer => :environment do
  Rails.logger.info 'Started #DatagramConsumer'
  $datagram_responses.subscribe(block: true) do |di, md, payload|
    d = DatagramResponseHandler.new(JSON.parse(payload)).handle!
    Rails.logger.info("ResponsesConsumer#datagram_consumer Pushing on #{d[:refresh_channel]} ...")
    Pusher.trigger(d[:refresh_channel], 'data', d)
    $redis.set(d[:refresh_channel], "1")
  end
end
