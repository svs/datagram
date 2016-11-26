class StreamSink < ActiveRecord::Base
  has_many :streamers
  has_many :datagrams, through: :streamers
end
