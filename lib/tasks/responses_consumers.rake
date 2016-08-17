task :watch_consumer => :environment do
  Rails.logger.info 'Started #WatchConsumer'
  $watch_responses.subscribe(block: true) do |di, md, payload|
    pl = JSON.parse(payload)
    w = WatchResponseHandler.new(pl).handle!
    context = {datagram: w[:datagram_token], watch: w[:watch_token], timestamp: w[:timestamp]}
    if w[:modified]
      Pusher.trigger(w[:refresh_channel], 'data', w)
      DgLog.new("#ResponseConsumer Push", context).log
      datagram = Datagram.find_by(token: w[:datagram_token])
      Streamer.where(datagram_id: datagram.id).each{|s| s.render} if datagram
    end
  end
end
