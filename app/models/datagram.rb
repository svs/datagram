class Datagram

  include Mongoid::Document

  field :name
  field :watch_ids, type: Array
  field :frequency, type: Integer
  field :at, type: String

  field :user_id, type: Integer

  def watches
    Watch.find(watch_ids) rescue []
  end

  def as_json(include_root = false)
    attributes.merge({watches: watches.map{|w| w.attributes.slice("name")},
                       responses: Hash[last_responses.map{|r| [r.watch.name, r.response_json]}],
                       timestamp: (Time.at(max_ts/1000) rescue Time.now)})
  end

  def publish
    ts = (Time.now.to_f  * 1000).round
    watches.each{|w| w.publish(datagram_id: self.id, timestamp: ts)}
  end

  def last_responses
    WatchResponse.where(datagram_id: self.id, timestamp: max_ts)
  end

  def max_ts
    WatchResponse.where(datagram_id: self.id).max(:timestamp)
  end

end
