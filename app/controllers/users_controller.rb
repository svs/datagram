class UsersController < ActionController::Base

  before_filter :authenticate_user!
  layout 'app'
  def profile
    @user = current_user
  end

end
