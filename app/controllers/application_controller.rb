class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :authenticate_user!
  after_filter :set_csrf_cookie_for_ng
  #after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index
  include Pundit

  rescue_from Pundit::NotAuthorizedError do
    redirect_to root_url
  end

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  protected

  def verified_request?
    super || form_authenticity_token == request.headers['X-XSRF-TOKEN']
  end

  def after_sign_in_path_for(resource)
    datagrams_path
  end

end
