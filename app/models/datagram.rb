class Datagram

  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  field :name
  field :watch_ids, type: Array
  field :frequency, type: Integer
  field :at, type: String

  field :user_id, type: Integer

  token length: 10

  def watches
    Watch.find(watch_ids) rescue []
  end

  def as_json(include_root = false)
    attributes.merge({
                       id: _id.to_s,
                       watches: watches.map{|w| w.attributes.slice("name", "token")},
                       responses: last_responses.map{|r| {name: r.watch.name, data: r.response_json, errors: r.error, metadata: r.metadata}},
                       timestamp: (Time.at(max_ts/1000) rescue Time.now)
                     }).except("_id")
  end

  def publish
    DatagramPublisher.new(self).publish
  end

  def last_responses
    WatchResponse.where(datagram_id: self.id, timestamp: max_ts)
  end

  def max_ts
    WatchResponse.where(datagram_id: self.id).max(:timestamp)
  end

end
