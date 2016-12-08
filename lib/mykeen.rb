module Mykeen
  def self.publish(name, args)
    if Rails.env.production?
      begin
        Keen.publish(name, args)
      rescue Exception => e
        Rails.logger.error e.message
      end
    end
  end
end
