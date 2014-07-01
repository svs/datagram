class Datagram

  include Mongoid::Document

  field :name
  field :watches, type: Array
  field :frequency, type: Integer
  field :at, type: String

  field :user_id, type: Integer

end
