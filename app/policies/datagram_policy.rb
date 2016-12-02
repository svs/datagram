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
      Datagram.all
      #Datagram.where(user_id: [user.id, user.linked_account_id]).where('archived IS DISTINCT FROM true')
    end
  end

end
