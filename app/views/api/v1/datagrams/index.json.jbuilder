json.array! @datagrams  do |datagram|
  json.id datagram.id
json.name datagram.name
json.last_update_timestamp datagram.last_update_timestamp
json.views datagram.views
json.default_view_url datagram.default_view_url



end