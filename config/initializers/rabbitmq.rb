if Rails.application.secrets.rabbitmq_url
  $conn = Bunny.new(Rails.application.secrets.rabbitmq_url)
elsif ENV['RABBITMQ_BIGWIG_TX_URL']
  $tx_conn = Bunny.new(ENV['RABBITMQ_BIGWIG_TX_URL'])
  $rx_conn = Bunny.new(ENV['RABBITMQ_BIGWIG_RX_URL'])
else
  $conn = Bunny.new
end

$conn.start

$ch_tx = ($conn || $tx_conn).create_channel
$ch_rx = ($conn || $rx_conn).create_channel
$watches  = $ch_tx.queue("watches", :durable => true)
$watch_responses  = $ch_rx.queue("watch_responses", :durable => true)
$datagrams =  $ch_tx.queue("datagrams", :durable => true)
$datagram_responses =  $ch_rx.queue("datagram_responses", :durable => true)
$x  = $ch_tx.default_exchange
