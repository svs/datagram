json.array! @datagrams  do |datagram|
  json.id datagram.id
json.name datagram.name
json.last_update_timestamp datagram.last_update_timestamp
json.views datagram.views
json.public_url datagram.public_url
json.paramSets datagram.param_sets
json.group datagram.group


end
