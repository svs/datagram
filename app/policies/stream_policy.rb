class StreamPolicy < ApplicationPolicy

  attr_reader :user, :stream

  def initialize(user, stream)
    @user = user
    @stream = stream
  end



  class Scope < Scope
    def resolve
      StreamSink.all
      #Datagram.where(user_id: [user.id, user.linked_account_id]).
    end
  end

end
