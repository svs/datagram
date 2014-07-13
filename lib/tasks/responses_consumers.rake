task :watch_consumer => :environment do
  Rails.logger.info 'Started WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    begin
      w = WatchResponseHandler.new(JSON.parse(payload)).handle!
      Pusher.trigger(w[:watch_token] || w[:watch_response_token], 'data', w)
      Rails.logger.info "#DatagramResponse on channel #{w[:token]}"
      Rails.logger.ap w
    rescue Exception => e
      puts e.backtrace
    end
  end
end


task :datagram_consumer => :environment do
  Rails.logger.info 'Started DatagramConsumer'
  $datagram_responses.subscribe(block: true) do |di, md, payload|
    ap JSON.parse(payload)
    d = DatagramResponseHandler.new(JSON.parse(payload)).handle!
    ap "#DatagramResponse on channel #{d[:token]}"
    ap d
    ap "--------------------------------"
    Pusher.trigger(d[:token], 'data', d)
  end
end
