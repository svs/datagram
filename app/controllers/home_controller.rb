class HomeController < ApplicationController

  def index
    if current_user
      @watches = current_user.watches
    end
    render
  end

end
