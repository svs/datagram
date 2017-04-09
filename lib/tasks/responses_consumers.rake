task :watch_consumer => :environment do
  Rails.logger.info 'Started #WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    parser = Yajl::Parser.new
    pl = parser.parse(payload)
    w = WatchResponseHandler.new(pl).handle!
    Pusher.trigger(w[:refresh_channel], 'data', w)
    pl = nil
    w = nil
    GC.start
  end
end
