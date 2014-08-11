task :watch_consumer => :environment do
  Rails.logger.info 'Started WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    Rails.logger.info "#WatchConsumer processing..."
    begin
      pl = JSON.parse(payload)
      w = WatchResponseHandler.new(pl).handle!
      if w[:modified] || pl.fetch("meta",{})["preview"]
        Pusher.trigger(w[:watch_token] || w[:watch_response_token], 'data', w)
        Rails.logger.info "#DatagramResponse on channel #{w[:token]}"
      else
        Rails.logger.info "#ResponsesConsumer#watch_consumer w[:token] not modified...."
      end
    rescue Exception => e
      puts e.backtrace
    end
  end
end


task :datagram_consumer => :environment do
  Rails.logger.info 'Started DatagramConsumer'
  $datagram_responses.subscribe(block: true) do |di, md, payload|
    d = DatagramResponseHandler.new(JSON.parse(payload)).handle!
    if d[:modified]
      Rails.logger.info("ResponsesConsumer#datagram_consumer Pushing ...")
      Pusher.trigger(d[:token], 'data', d)
    else
      Rails.logger.info "ResponsesConsumer#datagram_consumer d[:token] not modified"
    end
  end
end
