class DatagramsController < ApplicationController

  def index
    if current_user.datagrams.empty?
      render 'wizard', layout: 'material'
    else
      render layout: 'material'
    end
  end

end
