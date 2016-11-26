class StreamerPolicy < ApplicationPolicy

  attr_reader :user, :datagram

  def initialize(user, streamer)
    @user = user
    @streamer = streamer
    @datagram = streamer.datagram
  end

  def update?
    user.id == datagram.user_id
  end

  def destroy?
    user.datagrams.include?(streamer.datagram)
  end


  class Scope < Scope
    def resolve
      Streamer.all
    end
  end

end
