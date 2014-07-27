if Rails.application.secrets.rmq_tx_url
  $conn = Bunny.new(Rails.application.secrets.rmq_tx_url)
else
  $conn = Bunny.new
end

$conn.start

$ch = $conn.create_channel
$watches  = $ch.queue("watches", :durable => true)
$watch_responses  = $ch.queue("watch_responses", :durable => true)
$datagrams =  $ch.queue("datagrams", :durable => true)
$datagram_responses =  $ch.queue("datagram_responses", :durable => true)
$x  = $ch.default_exchange
