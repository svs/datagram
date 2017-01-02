class HomeController < ApplicationController

  skip_before_filter :authenticate_user!

  def index
    skip_authorization
    skip_policy_scope
    if current_user
      redirect_to datagrams_url and return
    end
    render layout: 'landing'
  end

  def prof
    GC.start if params[:gc]
    render json: ObjectSpace.count_objects
  end

end
