task :watch_consumer => :environment do
  Rails.logger.info 'Started WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    begin
      w = WatchResponseHandler.new(JSON.parse(payload)).handle!
      if w[:modified]
        Pusher.trigger(w[:watch_token] || w[:watch_response_token], 'data', w)
        Rails.logger.info "#DatagramResponse on channel #{w[:token]}"
      else
        Rails.logger.info "w[:token] not modified...."
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
    ap d
    if d[:modified]
      Pusher.trigger(d[:token], 'data', d)
    else
      Rails.logger.info "d[:token] not modified"
    end
  end
end
