module Mykeen
  def self.publish(name, args)
    if Rails.env.production?
      Keen.publish(name, args)
    end
  end
end
