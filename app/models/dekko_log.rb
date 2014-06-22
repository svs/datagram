class WatchResponse

  include Mongoid::Document
  include Mongoid::Token

  field :watch_id, Integer
  field :status_code, Integer

  token length: 10



end
