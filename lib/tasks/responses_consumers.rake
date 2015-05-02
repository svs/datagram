task :watch_consumer => :environment do
  Rails.logger.info 'Started #WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    Rails.logger.info "#WatchConsumer processing..."
    begin
      pl = JSON.parse(payload)
      w = WatchResponseHandler.new(pl).handle!
      if w[:datagram]
        if w[:modified]
          Pusher.trigger(w[:refresh_channel], 'data', w)
          Rails.logger.info "ResponseConsumer#Datagram #{w[:datagram].token} pushed on channel #{w[:refresh_channel]}"
        end
      else
        Pusher.trigger(w[:watch_token] || w[:watch_response_token], 'data', w)
        Rails.logger.info "ResponseConsumer#watch_consumer on channel #{w[:token]}"
      end
    rescue Exception => e
      puts e.message
      puts e.backtrace
    end
  end
end
