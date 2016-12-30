class RoController < ApplicationController

  def index
    skip_policy_scope
    render layout: 'app'
  end

end
