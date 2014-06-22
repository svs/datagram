class Watch < ActiveRecord::Base

  validates :user_id, { presence: true }
  validates :frequency, { presence: true }

  after_save :log!


  def log!
    d = DekkoLog.create(watch_id: self.id, key: SecureRandom.base64)
  end

end
