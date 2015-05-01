class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
      # You need to implement the method below in your model (e.g. app/models/user.rb)
    current_user.update(google_token: request.env["omniauth.auth"]["credentials"]["token"],
                        google_refresh_token: request.env["omniauth.auth"]["credentials"]["refresh_token"])
    redirect_to profile_path, notice: "Connected Google Account"

  end
end
