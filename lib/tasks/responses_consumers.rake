task :watch_consumer => :environment do
  Rails.logger.info 'Started #WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    pl = JSON.parse(payload)
    w = WatchResponseHandler.new(pl).handle!
    ap w
    context = {datagram: w[:datagram_token], watch: w[:watch_token], timestamp: w[:timestamp]}
    Pusher.trigger(w[:refresh_channel], 'data', w)
    datagram = Datagram.find_by(token: w[:datagram_token])
    DgLog.new("#ResponseConsumer Push", context).log
  end
end
