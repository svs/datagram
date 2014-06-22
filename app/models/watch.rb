class Watch < ActiveRecord::Base

  validates :user_id, { presence: true }
  validates :frequency, { presence: true }


  def publish
    log!
    attributes.merge("key" => @key)
  end


  private

  def log!
    DekkoLog.create(watch_id: self.id, key: SecureRandom.base64).tap{|d|
      @key = d.key
    }
  end


end
