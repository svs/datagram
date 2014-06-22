class WatchResponse

  include Mongoid::Document
  include Mongoid::Token

  field :watch_id, type: Integer
  field :status_code, type: Integer

  token length: 10




end
