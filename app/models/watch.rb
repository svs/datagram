class Watch < ActiveRecord::Base

  validates :user_id, { presence: true }
  validates :frequency, { presence: true }


  def publish(callback_host = "http://localhost:3000")
    log!
    callback_url = "#{callback_host}/watches/#{@key}"
    attributes.merge("key" => @key, "callback_url" => callback_url)
  end


  private

  def log!
    WatchResponse.create(watch_id: self.id).tap{|d|
      @key = d.token
    }
  end


end
