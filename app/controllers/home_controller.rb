class HomeController < ApplicationController

  skip_before_filter :authenticate_user!

  def index
    if current_user
      @watches = current_user.watches
      redirect_to datagrams_url and return
    end
    render layout: 'landing'
  end

end
