class SourcePolicy < ApplicationPolicy

  attr_reader :user, :source

  def initialize(user, source)
    @user = user
    @source = source
  end

  def update?
    user.id == source.user_id
  end

  def allow?
    user.is_admin
  end


  class Scope < Scope
    def resolve
      if user.is_admin
        Source.all  #where(user_id: user.id)
      else
        Source.all.map{|s| s.attributes.except("url")}
      end
    end
  end

end
