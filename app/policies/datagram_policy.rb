class DatagramPolicy < ApplicationPolicy

  attr_reader :user, :datagram

  def initialize(user, datagram)
    @user = user
    @datagram = datagram
  end

  def update?
    user.id == datagram.user_id
  end


  class Scope < Scope
    def resolve
      Datagram.where(user_id: [user.id, user.linked_account_id], archived: false)
    end
  end

end
