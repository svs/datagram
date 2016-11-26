class StreamSinkPolicy < ApplicationPolicy

  attr_reader :user, :datagram

  def initialize(user, stream_sink)
    @user = user
    @stream_sink = stream_sink
    @datagram = stream_sink.datagram
  end

  def update?
    user.id == datagram.user_id
  end


  class Scope < Scope
    def resolve
      StreamSink.all
    end
  end

end
