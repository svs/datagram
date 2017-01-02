class StreamSinkPolicy < ApplicationPolicy

  attr_reader :user, :datagram

  def initialize(user, stream_sink)
    @user = user
    @stream_sink = stream_sink
  end

  def update?
  end

  def show?
    true
  end

  class Scope < Scope
    def resolve
      StreamSink.all
    end
  end

end
