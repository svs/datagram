if ENV['RABBITMQ_BIGWIG_TX_URL']
  $conn = Bunny.new(ENV['RABBITMQ_BIGWIG_TX_URL'])
else
  $conn = Bunny.new
end

$conn.start

$ch = $conn.create_channel
$q  = $ch.queue("watches", :durable => true)
$r  = $ch.queue("responses", :durable => true)
$x  = $ch.default_exchange
