class DatagramPolicy < ApplicationPolicy

  attr_reader :user, :datagram

  def initialize(user, datagram)
    @user = user
    @datagram = datagram
  end

  def update?
    user.id == datagram.user_id
  end

  def show?
    !user.ro
  end

  def index?
    true
  end

  def new?
    true
  end

  class Scope < Scope
    def resolve
      Datagram.where('archived IS DISTINCT FROM true')
    end
  end

end
