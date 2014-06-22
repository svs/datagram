class Watch < ActiveRecord::Base

  validates :user_id, { presence: true }
  validates :interval, { presence: true }

end
