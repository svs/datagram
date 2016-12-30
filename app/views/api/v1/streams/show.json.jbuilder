json.name @stream_sink.name
json.data Hash[@streamers.map{|s| [s.name, s.response_json]}]
