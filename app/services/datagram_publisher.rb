class DatagramPublisher

  def initialize(datagram:exchange: $x, queue: $q)
    @datagram = datagram
  end

  def publish
    exchange.publish(
                     {
                       datagram_id: datagram.id,
                       timestamp: (Time.now.to_f  * 1000).round,
                       watches: payload.to_json,
                       routing_key: queue.name
                     })
  end

  private

  attr_reader :datagram

  def watches
    datagram.watches.map{|w|
      log!(datagram_id, timestamp)
      w.attributes.merge(key: @key, callback_url: callback_url )
    }
  end


end
