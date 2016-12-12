class StreamSink < ActiveRecord::Base
  has_many :streamers
  has_many :datagrams, through: :streamers

  def as_json(include_root = false)
    attributes.merge(streamers: streamers)
  end
end
