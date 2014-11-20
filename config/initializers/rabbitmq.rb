endpoint = Rails.application.secrets.rabbitmq_url || ENV['RABBITMQ_URL'] || "amqp://localhost:5672"
username = Rails.application.secrets.rabbitmq_user || "guest"
password = Rails.application.secrets.rabbitmq_password || "guest"

Rails.logger.info("#Bunny connecting to #{endpoint}")

$conn = Bunny.new(endpoint)

$conn.start

$ch = $conn.create_channel
$watches  = $ch.queue("watches", :durable => true)
$watch_responses  = $ch.queue(Rails.application.secrets["watch_response_q"] || "watch_responses", :durable => true)
$datagrams =  $ch.queue("datagrams", :durable => true)
$datagram_responses =  $ch.queue(Rails.application.secrets["datagram_response_q"] || "datagram_responses", :durable => true)
$x  = $ch.direct('datagrams_exchange', auto_delete: false)

$watches.bind('datagrams_exchange')
$datagrams.bind('datagrams_exchange')
