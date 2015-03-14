class SourcePolicy < ApplicationPolicy

  attr_reader :user, :source

  def initialize(user, source)
    @user = user
    @source = source
  end

  def update?
    user.id == source.user_id
  end


  class Scope < Scope
    def resolve
      Source.where(user_id: user.id)
    end
  end

end
