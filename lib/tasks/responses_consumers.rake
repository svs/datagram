task :watch_consumer => :environment do
  Rails.logger.info 'Started #WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    Rails.logger.info "#WatchConsumer processing..."
      pl = JSON.parse(payload)
      w = WatchResponseHandler.new(pl).handle!
      if w[:datagram]
        if w[:modified]
          Pusher.trigger(w[:refresh_channel], 'data', w)
          Rails.logger.info "ResponseConsumer#Datagram #{w[:datagram].token} pushed on channel #{w[:refresh_channel]}"
        end
      else
        Pusher.trigger(w[:refresh_channel], 'data', w)
        Rails.logger.info "ResponseConsumer#Watch #{w[:watch_token]} pushed on channel #{w[:refresh_channel]}"
      end
  end
end
