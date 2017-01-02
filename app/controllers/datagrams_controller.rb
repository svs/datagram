class DatagramsController < ApplicationController

  def index
    @datagrams = policy_scope(Datagram)
    render layout: 'app'
  end

end
