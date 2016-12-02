class WatchPolicy < ApplicationPolicy

  attr_reader :user, :watch

  def initialize(user, watch)
    @user = user
    @watch = watch
  end

  def update?
    user.id == watch.user_id
  end


  class Scope < Scope
    def resolve
      Watch.all
      #Watch.where(user_id: [user.id, user.linked_account_id])
    end
  end

end
