json.array! @streams do |stream|
  json.name stream.name
  json.token stream.token
  json.streamers do
    json.array! stream.streamers do |streamer|
      json.name streamer.name
      json.data streamer.response_json
      json.datagram_id streamer.datagram_id
      json.last_run_at streamer.last_run_at
    end
  end
end
