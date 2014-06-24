class Watch < ActiveRecord::Base

  validates :user_id, { presence: true }
  validates :frequency, { presence: true }


  def publish(callback_host = "http://localhost:3000")
    log!
    callback_url = "#{callback_host}/watch_responses/#{@key}"
    attributes.merge("key" => @key, "callback_url" => callback_url)
  end


  private

  def log!
    WatchResponse.create(watch_id: self.id, previous_response_token: previous_response_token).tap{|d|
      @key = d.token
    }
  end

  def previous_response_token
    WatchResponse.where(watch_id: self.id).last.token rescue nil
  end


end
