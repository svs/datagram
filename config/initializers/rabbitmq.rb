ap Rails.application.secrets
endpoint = Rails.application.secrets.rabbitmq_url || "amqp://localhost:5672"
username = Rails.application.secrets.rabbitmq_user || "guest"
password = Rails.application.secrets.rabbitmq_password || "guest"

$conn = Bunny.new(endpoint)

$conn.start

$ch = $conn.create_channel
$watches  = $ch.queue("watches", :durable => true)
$watch_responses  = $ch.queue("watch_responses", :durable => true)
$datagrams =  $ch.queue("datagrams", :durable => true)
$datagram_responses =  $ch.queue("datagram_responses", :durable => true)
$x  = $ch.direct('datagrams_exchange', auto_delete: false)
