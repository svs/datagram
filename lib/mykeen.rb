module Mykeen
  def self.publish(name, args)
    if Rails.env.production?
      Keen.publish(name, args) rescue nil
    end
  end
end
