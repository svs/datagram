class DekkoLog < ActiveRecord::Base

  validates :watch_id, presence: true
  validates :key, presence: true

  belongs_to :watch

end
